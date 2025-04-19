# ShhhDrop - Encrypted Anonymous Texting Platform

## Overview

ShhhDrop is a secure, anonymous messaging platform that allows users to communicate without exposing their identities. Built with end-to-end encryption, this application ensures that your messages remain private and secure.

## Live Demo

**[Try ShhhDrop Now](https://shhhdrop.netlify.app/)**  
*Best viewed on mobile devices*

## Some Screenshots

<img src="https://github.com/user-attachments/assets/dacd507d-44e5-475a-b39e-2e7ca4ccfed4" width="300" />

----------------------

<img src="https://github.com/user-attachments/assets/42adb50f-d898-4e6a-9686-b255089b2495" width="300" />

----------------------

<img src="https://github.com/user-attachments/assets/b91e49b9-17d3-4f8a-9456-4088bfe355a7" width="300" />

----------------------

<img src="https://github.com/user-attachments/assets/0c40ee13-531e-49af-872d-b63fd79cbb40" width="300" />

----------------------

<img src="https://github.com/user-attachments/assets/5db76635-c9fd-4f47-8973-939d8a621469" width="300" />


## Features

- **End-to-End Encryption**: All messages are encrypted using CryptoJS, ensuring that only the intended recipient can read them
- **Anonymous Communication**: Exchange messages without revealing your identity
- **Real-time Messaging**: Instant message delivery powered by Firebase
- **Mobile-Optimized Interface**: Designed primarily for mobile users
- **No Registration Required**: Start messaging immediately without creating an account
- **Message Expiration**: Optional self-destructing messages for enhanced privacy

## Tech Stack

- **Frontend**: React.js
- **Build Tool**: Vite
- **Backend/Database**: Firebase
- **Encryption**: CryptoJS
- **Deployment**: Netlify

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Local Development

1. Clone the repository
git clone https://github.com/shashwatssp/ShhhDrop.git
cd ShhhDrop


2. Install dependencies


3. Create a `.env` file in the root directory with your Firebase configuration

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id


4. Start the development server
npm run dev


5. Open your browser and navigate to `http://localhost:5173`

## Deployment

The application is configured for easy deployment to Netlify. Simply connect your GitHub repository to Netlify and configure the build settings:

- Build command: `npm run build`
- Publish directory: `dist`

## How It Works

1. Users create or join a secure chat room
2. Messages are encrypted on the client-side before being sent to Firebase
3. Only users with the correct decryption keys can read the messages
4. No personal information is stored or required

## Security Considerations

- All message content is encrypted using AES-256
- No user tracking or logging of IP addresses
- Messages can be set to expire after being read
- No message content is stored on our servers in plain text

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Link: [https://github.com/shashwatssp/ShhhDrop](https://github.com/shashwatssp/ShhhDrop)

## Acknowledgements

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Vite](https://vitejs.dev/)
- [CryptoJS](https://cryptojs.gitbook.io/docs/)
- [Netlify](https://www.netlify.com/)
