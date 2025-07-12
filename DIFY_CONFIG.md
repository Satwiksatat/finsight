# Dify Configuration Guide

This guide explains how to properly configure your FinSight chatbot with Dify AI platform.

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Dify API Configuration
DIFY_API_URL=http://your-dify-instance:80
DIFY_APP_ID=your_dify_app_id_here
DIFY_API_KEY=your_dify_api_key_here

# Optional: Development settings
NODE_ENV=development
DEBUG=true
```

## Getting Your Dify Credentials

### 1. Dify App ID
- Log into your Dify instance
- Go to your application settings
- Copy the **App ID** from the API Access section

### 2. Dify API Key
- In the same API Access section
- Copy the **API Key** (server-side key for better security)

### 3. Dify API URL
- Use your Dify instance URL (e.g., `http://localhost:80` for local development)
- For production, use your deployed Dify instance URL

## API Endpoints Used

### 1. Chat Messages API
**Endpoint:** `POST /v1/chat-messages`

**Purpose:** Main chat functionality with streaming responses

**Request Body:**
```json
{
  "inputs": {},
  "query": "User message",
  "response_mode": "streaming",
  "user": "chat_id",
  "conversation_id": "chat_id",
  "app_id": "your_app_id"
}
```

**Features:**
- ✅ Streaming responses
- ✅ Conversation continuity
- ✅ Structured content support (charts, images, code)
- ✅ Error handling

### 2. Title Generation API
**Endpoint:** `POST /v1/chat-messages` (same endpoint, different configuration)

**Purpose:** Automatic conversation title generation

**Request Body:**
```json
{
  "inputs": {
    "query": "First user message",
    "context": "Conversation context"
  },
  "response_mode": "blocking",
  "user": "system-title-generator",
  "app_id": "your_app_id"
}
```

## Additional Dify APIs (Future Enhancements)

### 3. Conversation Management API
**Endpoint:** `GET /v1/conversations`

**Purpose:** Retrieve conversation history from Dify

### 4. Message History API
**Endpoint:** `GET /v1/messages`

**Purpose:** Get message history for a specific conversation

### 5. File Upload API
**Endpoint:** `POST /v1/files/upload`

**Purpose:** Upload files for document analysis

## Configuration Examples

### Local Development
```env
DIFY_API_URL=http://localhost:80
DIFY_APP_ID=app-abc123def456
DIFY_API_KEY=sk-xyz789abc123
NODE_ENV=development
DEBUG=true
```

### Production
```env
DIFY_API_URL=https://your-dify-instance.com
DIFY_APP_ID=app-prod-123
DIFY_API_KEY=sk-prod-456
NODE_ENV=production
```

## Testing Your Configuration

Use the provided test script:

```bash
npm run test-api
```

This will test your Dify API connection and verify your credentials.

## Troubleshooting

### Common Issues

1. **"Dify App ID not configured"**
   - Verify `DIFY_APP_ID` is set in `.env.local`
   - Check that the App ID is correct in your Dify dashboard

2. **"Dify API Key not configured"**
   - Verify `DIFY_API_KEY` is set in `.env.local`
   - Ensure you're using the server-side API key

3. **"Connection refused"**
   - Check if your Dify instance is running
   - Verify the `DIFY_API_URL` is correct
   - Ensure the port is accessible

4. **"Unauthorized"**
   - Verify your API key has proper permissions
   - Check that the App ID matches your application

### Debug Mode

Enable detailed logging by setting:
```env
DEBUG=true
NODE_ENV=development
```

## Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Use server-side API keys** (not client-side keys)
3. **Rotate API keys regularly**
4. **Use HTTPS in production**
5. **Implement proper user authentication**

## Next Steps

Once configured:

1. **Test the API connection** with `npm run test-api`
2. **Start the development server** with `npm run dev`
3. **Create a test conversation** to verify functionality
4. **Check browser console** for any errors
5. **Monitor API usage** in your Dify dashboard

## Support

For Dify-specific issues:
- [Dify Documentation](https://docs.dify.ai/)
- [Dify API Reference](https://docs.dify.ai/api-reference)
- [Dify Community](https://community.dify.ai/)

For FinSight-specific issues:
- Check the troubleshooting section in `README.md`
- Review browser console for error messages
- Use the debug tools provided in the application 