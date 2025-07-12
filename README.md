# FinSight - AI-Powered Financial Assistant

A professional chatbot interface for financial analysis and strategy, built with Next.js and integrated with Dify AI platform.

## Features

- 🤖 **AI-Powered Chat**: Intelligent financial analysis and strategy recommendations
- 📊 **Chart Visualization**: Interactive charts and data visualization
- 💬 **Conversation Management**: Create, organize, and manage chat conversations
- 🏷️ **Auto-Title Generation**: Automatic conversation title generation
- 📱 **Responsive Design**: Modern, professional UI that works on all devices
- 🔄 **Real-time Streaming**: Live streaming responses for better user experience
- 📁 **File Upload**: Support for financial document uploads (coming soon)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Dify AI platform instance
- Dify API credentials

## Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Configure your environment variables in `.env.local`:
```env
# Dify API Configuration
DIFY_API_URL=http://your-dify-instance:80
DIFY_APP_ID=your_dify_app_id_here
DIFY_API_KEY=your_dify_api_key_here

# Title Generation Configuration (optional - uses same API if not set)
DIFY_TITLE_BOT_URL=http://your-dify-instance:80/v1/chat-messages
DIFY_TITLE_BOT_API_KEY=your_dify_title_bot_api_key_here

# Optional: Conversation Management
CONVERSATION_RETENTION_DAYS=30
MAX_MESSAGES_PER_CONVERSATION=100
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Dify Configuration

### Setting up Dify

1. Deploy Dify AI platform following their [official documentation](https://docs.dify.ai/)
2. Create a new application in Dify
3. Configure your application with financial analysis capabilities
4. Get your API credentials from the Dify dashboard

### API Endpoints

The application uses the following Dify API endpoints:
- `/v1/chat-messages` - Main chat functionality
- `/v1/chat-messages` - Title generation (same endpoint, different configuration)

## Project Structure

```
finsight/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/          # Chat API endpoints
│   │   └── utils/         # Utility functions
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── chat/             # Chat-related components
│   ├── common/           # Shared components
│   └── ui/               # UI components
├── context/              # React context providers
├── lib/                  # Utility libraries and types
└── public/               # Static assets
```

## Key Components

### ChatContext
Manages conversation state, including:
- Active chat selection
- Conversation history
- Title generation
- Local storage persistence

### ChatWindow
Main chat interface component with:
- Message display
- Input handling
- Loading states
- Responsive design

### API Routes
- `/api/chat` - Main chat endpoint with streaming support
- `/api/chat/generate-title` - Automatic title generation

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for styling

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify your Dify instance is running
   - Check API credentials in `.env.local`
   - Ensure network connectivity to Dify instance

2. **Title Generation Not Working**
   - Verify Dify API key has proper permissions
   - Check browser console for error messages
   - Ensure title generation app is configured in Dify

3. **Streaming Issues**
   - Check Dify streaming configuration
   - Verify response format matches expected structure
   - Check browser console for parsing errors

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the [Dify documentation](https://docs.dify.ai/)
- Review the troubleshooting section above
- Open an issue in the repository
