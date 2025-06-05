# Tokenwise

Tokenwise is a TypeScript-based Express application that provides a robust backend service. The project is built with modern technologies and follows best practices for scalability and maintainability.

## Features

- TypeScript-based Express server
- MongoDB database integration with Mongoose
- JWT authentication
- CORS support
- Environment variable configuration
- ESLint for code quality
- Transformers integration for AI capabilities

## Prerequisites

- Node.js (Latest LTS version recommended)
- MongoDB
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
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
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 