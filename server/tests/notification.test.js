// Covers the notification REST endpoints (list, unread count, mark read,
// mark all read, delete). Notification *creation* is already exercised
// indirectly via follow.test.js (follow -> notification) and stream.test.js
// / stream.service goLive path -- this file focuses on the read-side API a
// logged-in user hits directly.

import request from 'supertest';
import app from '../src/app.js';
import './setup.js';
import User from '../src/models/user.model.js';
import Notification from '../src/models/notification.model.js';

const signupAndLogin = async () => {
  const creds = {
    username: 'notifyme',
    email: 'notifyme@streamverse.test',
    fullName: 'Notify Me',
    password: 'p4ssword123',
  };
  await request(app).post('/api/v1/auth/signup').send(creds);
  const res = await request(app).post('/api/v1/auth/login').send({ identifier: creds.email, password: creds.password });
  return { token: res.body.data.accessToken, userId: res.body.data.user.id };
};

describe('Notifications', () => {
  it('lists notifications and reports an accurate unread count', async () => {
    const { token, userId } = await signupAndLogin();
    await Notification.create([
      { recipient: userId, type: 'system', message: 'Welcome to StreamVerse!' },
      { recipient: userId, type: 'follow', message: 'Someone followed you' },
    ]);

    const list = await request(app).get('/api/v1/notifications').set('Authorization', `Bearer ${token}`);
    expect(list.statusCode).toBe(200);
    expect(list.body.data.notifications).toHaveLength(2);

    const unread = await request(app).get('/api/v1/notifications/unread-count').set('Authorization', `Bearer ${token}`);
    expect(unread.body.data.count).toBe(2);
  });

  it('marks one notification read, then all read', async () => {
    const { token, userId } = await signupAndLogin();
    const [n1, n2] = await Notification.create([
      { recipient: userId, type: 'system', message: 'First' },
      { recipient: userId, type: 'system', message: 'Second' },
    ]);

    await request(app).patch(`/api/v1/notifications/${n1._id}/read`).set('Authorization', `Bearer ${token}`);
    let unread = await request(app).get('/api/v1/notifications/unread-count').set('Authorization', `Bearer ${token}`);
    expect(unread.body.data.count).toBe(1);

    await request(app).patch('/api/v1/notifications/read-all').set('Authorization', `Bearer ${token}`);
    unread = await request(app).get('/api/v1/notifications/unread-count').set('Authorization', `Bearer ${token}`);
    expect(unread.body.data.count).toBe(0);

    expect((await Notification.findById(n2._id)).isRead).toBe(true);
  });

  it("prevents a user from reading or deleting someone else's notification", async () => {
    const { token: tokenA } = await signupAndLogin();
    const otherUser = await User.create({
      username: 'othernotify',
      email: 'othernotify@streamverse.test',
      fullName: 'Other Notify',
      password: 'p4ssword123',
    });
    const foreignNotification = await Notification.create({
      recipient: otherUser._id,
      type: 'system',
      message: 'Not yours',
    });

    const readAttempt = await request(app)
      .patch(`/api/v1/notifications/${foreignNotification._id}/read`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(readAttempt.statusCode).toBe(404);

    const deleteAttempt = await request(app)
      .delete(`/api/v1/notifications/${foreignNotification._id}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(deleteAttempt.statusCode).toBe(404);
  });

  it('deletes a notification', async () => {
    const { token, userId } = await signupAndLogin();
    const notification = await Notification.create({ recipient: userId, type: 'system', message: 'Delete me' });

    const res = await request(app)
      .delete(`/api/v1/notifications/${notification._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(await Notification.findById(notification._id)).toBeNull();
  });
});
