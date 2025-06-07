# Tokenwise

Tokenwise is a proxy server to cache your open-ai API responses and reduce your token usage and bills.

## Prerequisites

- Node.js (Latest LTS version recommended)
- MongoDB
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/varun-r-boop/tokenwise.git
cd tokenwise
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Available Scripts

- `npm start` - Runs the compiled JavaScript code
- `npm run dev` - Runs the TypeScript code directly using ts-node
- `npm run build` - Compiles TypeScript to JavaScript
- `npm run lint` - Runs ESLint to check code quality
- `npm run lint:fix` - Runs ESLint and automatically fixes issues

## Project Structure

```
src/
├── controller/    # Request handlers
├── db/           # Database configuration
├── models/       # Mongoose models
├── routes/       # API routes
├── utils/        # Utility functions
└── index.ts      # Application entry point
```

## Dependencies

### Main Dependencies
- express: Web framework
- mongoose: MongoDB object modeling
- jsonwebtoken: JWT authentication
- bcrypt: Password hashing
- cors: Cross-origin resource sharing
- dotenv: Environment variable management
- @xenova/transformers: AI capabilities

### Development Dependencies
- typescript: TypeScript support
- ts-node: TypeScript execution
- eslint: Code linting
- @types/*: TypeScript type definitions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b users/username/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin users/username/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
