# StreamVerse — Folder Structure

```
StreamVerse/
├── README.md
├── .gitignore
├── docs/
│   ├── 01-planning.md
│   ├── 02-folder-structure.md
│   ├── 03-database-design.md
│   ├── 04-api-design.md
│   ├── architecture-diagram.md
│   └── deployment-guide.md
│
├── server/                              # Express + Socket.io API — deployed to Render
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                    # Mongoose connection
│   │   │   ├── cloudinary.js            # Cloudinary SDK config
│   │   │   ├── env.js                   # Validated env var export
│   │   │   ├── logger.js                # Winston logger config
│   │   │   └── passport.js              # Google OAuth strategy
│   │   │
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── channel.model.js
│   │   │   ├── stream.model.js
│   │   │   ├── video.model.js
│   │   │   ├── comment.model.js
│   │   │   ├── like.model.js
│   │   │   ├── follow.model.js
│   │   │   ├── notification.model.js
│   │   │   ├── category.model.js
│   │   │   ├── chatMessage.model.js
│   │   │   └── refreshToken.model.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── channel.controller.js
│   │   │   ├── stream.controller.js
│   │   │   ├── video.controller.js
│   │   │   ├── comment.controller.js
│   │   │   ├── like.controller.js
│   │   │   ├── follow.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── category.controller.js
│   │   │   ├── search.controller.js
│   │   │   └── admin.controller.js
│   │   │
│   │   ├── routes/
│   │   │   ├── index.js                 # mounts all routes under /api/v1
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── channel.routes.js
│   │   │   ├── stream.routes.js
│   │   │   ├── video.routes.js
│   │   │   ├── comment.routes.js
│   │   │   ├── like.routes.js
│   │   │   ├── follow.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── category.routes.js
│   │   │   ├── search.routes.js
│   │   │   └── admin.routes.js
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── user.service.js
│   │   │   ├── channel.service.js
│   │   │   ├── stream.service.js
│   │   │   ├── video.service.js
│   │   │   ├── notification.service.js
│   │   │   ├── email.service.js
│   │   │   └── cloudinary.service.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js       # verifyJWT, attach req.user
│   │   │   ├── role.middleware.js       # requireRole('admin' | 'streamer')
│   │   │   ├── error.middleware.js      # centralized error handler
│   │   │   ├── notFound.middleware.js   # 404 handler
│   │   │   ├── rateLimiter.middleware.js
│   │   │   ├── upload.middleware.js     # Multer config
│   │   │   ├── validate.middleware.js   # express-validator result handler
│   │   │   └── requestLogger.middleware.js  # Morgan -> Winston stream
│   │   │
│   │   ├── validations/
│   │   │   ├── auth.validation.js
│   │   │   ├── user.validation.js
│   │   │   ├── channel.validation.js
│   │   │   ├── stream.validation.js
│   │   │   ├── video.validation.js
│   │   │   └── comment.validation.js
│   │   │
│   │   ├── utils/
│   │   │   ├── ApiError.js              # custom error class
│   │   │   ├── ApiResponse.js           # centralized response envelope
│   │   │   ├── asyncHandler.js
│   │   │   ├── generateTokens.js        # sign access/refresh JWTs
│   │   │   └── constants.js             # enums: roles, categories, etc.
│   │   │
│   │   ├── sockets/
│   │   │   ├── index.js                 # io initialization, auth middleware for sockets
│   │   │   ├── chat.socket.js           # join/leave room, message, typing
│   │   │   └── stream.socket.js         # viewer count, live notifications
│   │   │
│   │   ├── app.js                       # Express app: middleware + routes wiring
│   │   └── server.js                    # HTTP server + Socket.io bootstrap, listens on PORT
│   │
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── user.test.js
│   │   ├── video.test.js
│   │   └── setup.js
│   │
│   ├── logs/                            # Winston file transport output (gitignored)
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── jest.config.js
│
├── client/                              # React 18 + Vite SPA — deployed to Vercel
│   ├── public/
│   │   └── favicon.svg
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                 # Button, Input, Modal, Avatar, Skeleton, Spinner, Badge
│   │   │   ├── layout/                 # Navbar, Sidebar, Footer, MainLayout
│   │   │   ├── home/                   # StreamCard, CategoryCard, FeaturedStream, TrendingRow
│   │   │   ├── stream/                 # StreamPlayer, StreamInfo, GoLiveButton, ViewerCount
│   │   │   ├── video/                  # VideoCard, VideoPlayer, CommentSection, CommentItem
│   │   │   ├── chat/                   # ChatBox, ChatMessage, TypingIndicator, EmojiPicker
│   │   │   ├── channel/                # ChannelHeader, ChannelTabs, FollowButton
│   │   │   ├── admin/                  # UserTable, StreamTable, AnalyticsChart
│   │   │   └── auth/                   # AuthForm, ProtectedRoute, GoogleLoginButton
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── BrowsePage.jsx
│   │   │   ├── SearchResults.jsx
│   │   │   ├── StreamPage.jsx
│   │   │   ├── VideoPage.jsx
│   │   │   ├── ChannelPage.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Signup.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   ├── ResetPassword.jsx
│   │   │   │   └── VerifyEmail.jsx
│   │   │   ├── user/
│   │   │   │   ├── ProfileSettings.jsx
│   │   │   │   ├── Notifications.jsx
│   │   │   │   ├── WatchHistory.jsx
│   │   │   │   └── Bookmarks.jsx
│   │   │   ├── streamer/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── StreamManager.jsx
│   │   │   │   ├── UploadVideo.jsx
│   │   │   │   └── ChannelSettings.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── ManageUsers.jsx
│   │   │       ├── ManageStreams.jsx
│   │   │       └── Reports.jsx
│   │   │
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   └── DashboardLayout.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useSocket.js
│   │   │   ├── useInfiniteScroll.js
│   │   │   └── useDebounce.js
│   │   │
│   │   ├── context/
│   │   │   └── SocketContext.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── axiosInstance.js         # Axios + interceptors (refresh-on-401)
│   │   │   ├── auth.service.js
│   │   │   ├── user.service.js
│   │   │   ├── stream.service.js
│   │   │   ├── video.service.js
│   │   │   └── channel.service.js
│   │   │
│   │   ├── store/
│   │   │   ├── authStore.js             # Zustand: user, tokens, login/logout
│   │   │   ├── streamStore.js           # Zustand: live status, viewer count
│   │   │   ├── notificationStore.js     # Zustand: unread notifications
│   │   │   └── uiStore.js               # Zustand: theme, modals, sidebar state
│   │   │
│   │   ├── utils/
│   │   │   ├── formatNumber.js          # 1200 -> 1.2K
│   │   │   ├── formatDuration.js
│   │   │   └── cn.js                    # classnames helper
│   │   │
│   │   ├── constants/
│   │   │   ├── routes.js
│   │   │   └── categories.js
│   │   │
│   │   ├── assets/
│   │   ├── styles/
│   │   │   └── index.css                # Tailwind directives + custom theme layer
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── tests/
│   │   ├── Button.test.jsx
│   │   └── FollowButton.test.jsx
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
└── .github/
    └── workflows/
        └── ci.yml
```

## Notes

- `server/src/app.js` vs `server/src/server.js`: `app.js` exports the configured Express app (used by both `server.js` and Jest/Supertest tests without opening a real port). `server.js` creates the `http.Server`, attaches Socket.io, and calls `.listen()`.
- Component folders under `client/src/components/` are grouped by feature/domain, not by type — this scales better than a flat `Button.jsx, Card.jsx, ...` folder once the app has 60+ components.
- `context/SocketContext.jsx` is the only React Context in the app; everything else global goes through Zustand. Socket connection is a side-effecting singleton, which fits Context better than a store.
