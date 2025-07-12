# FinSight Setup Guide

This guide will help you set up the FinSight chatbot with Dify AI platform.

## Prerequisites

1. **Node.js 18+** installed on your system
2. **Dify AI platform** instance running
3. **Dify API credentials** (App ID and API Key)

## Step 1: Clone and Install

```bash
# Navigate to the project directory
cd FinSightUI/finsight

# Install dependencies
npm install
```

## Step 2: Environment Configuration

1. Create a `.env.local` file in the project root:
```bash
touch .env.local
```

2. Add the following configuration to `.env.local`:
```env
# Dify API Configuration
DIFY_API_URL=http://your-dify-instance:80
DIFY_APP_ID=your_dify_app_id_here
DIFY_API_KEY=your_dify_api_key_here

# Title Generation Configuration (optional)
DIFY_TITLE_BOT_URL=http://your-dify-instance:80/v1/chat-messages
DIFY_TITLE_BOT_API_KEY=your_dify_title_bot_api_key_here

# Optional: Conversation Management
CONVERSATION_RETENTION_DAYS=30
MAX_MESSAGES_PER_CONVERSATION=100

# Development
NODE_ENV=development
DEBUG=true
```

## Step 3: Dify Configuration

### 3.1 Create Dify Application

1. Log into your Dify instance
2. Create a new application
3. Choose "Chat Application" type
4. Configure your application with financial analysis capabilities

### 3.2 Get API Credentials

1. Go to your application settings
2. Navigate to "API Access"
3. Copy the following:
   - **App ID**
   - **API Key**

### 3.3 Update Environment Variables

Replace the placeholder values in `.env.local`:
```env
DIFY_API_URL=http://your-actual-dify-url:80
DIFY_APP_ID=your-actual-app-id
DIFY_API_KEY=your-actual-api-key
```

## Step 4: Test the Setup

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000)

3. Try sending a test message like:
   - "Hello, can you help me with financial analysis?"
   - "What are the key financial KPIs I should track?"

## Step 5: Verify Features

### 5.1 Chat Functionality
- ✅ Messages are sent and received
- ✅ Streaming responses work
- ✅ Conversation history is saved

### 5.2 Title Generation
- ✅ New conversations get auto-generated titles
- ✅ Titles are relevant to the conversation content

### 5.3 Conversation Management
- ✅ New chats can be created
- ✅ Previous conversations are loaded
- ✅ Conversations persist between sessions

## Troubleshooting

### Common Issues

1. **"Failed to connect to the chat service"**
   - Check your Dify instance is running
   - Verify API credentials are correct
   - Ensure network connectivity

2. **"Missing environment variables"**
   - Verify `.env.local` file exists
   - Check all required variables are set
   - Restart the development server

3. **Title generation not working**
   - Check browser console for errors
   - Verify Dify API has proper permissions
   - Ensure title generation endpoint is accessible

4. **Streaming issues**
   - Check Dify streaming configuration
   - Verify response format matches expected structure
   - Check browser console for parsing errors

### Debug Mode

Enable detailed logging by setting:
```env
DEBUG=true
NODE_ENV=development
```

### API Testing

Test your Dify API directly:
```bash
curl -X POST "http://your-dify-url:80/v1/chat-messages" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {},
    "query": "Hello, test message",
    "response_mode": "blocking",
    "user": "test-user"
  }'
```

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DIFY_API_URL=https://your-production-dify-url
DIFY_APP_ID=your-production-app-id
DIFY_API_KEY=your-production-api-key
```

### Build and Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Verify your Dify configuration
4. Check the [Dify documentation](https://docs.dify.ai/)

## Next Steps

Once setup is complete, you can:

1. Customize the UI theme and branding
2. Add additional financial analysis features
3. Integrate with external data sources
4. Deploy to production environment 