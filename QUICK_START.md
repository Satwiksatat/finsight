# 🚀 Quick Start Guide

Get your FinSight chatbot running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment

Create `.env.local` file:

```env
DIFY_API_URL=http://172.16.3.123:80
DIFY_APP_ID=your_dify_app_id_here
DIFY_API_KEY=your_dify_api_key_here
```

## 3. Test API Connection

```bash
npm run test-api
```

## 4. Start Development Server

```bash
npm run dev
```

## 5. Open Browser

Visit [http://localhost:3000](http://localhost:3000)

## ✅ What's Fixed

### Chat Functionality
- ✅ Streaming responses from Dify API
- ✅ Proper message handling and display
- ✅ Conversation persistence in localStorage
- ✅ Error handling and user feedback

### Title Generation
- ✅ Automatic title generation after first response
- ✅ Smart title updates based on conversation content
- ✅ Fallback to default titles if API fails

### Conversation Management
- ✅ Create new conversations
- ✅ Switch between conversations
- ✅ Delete and archive conversations
- ✅ Search and filter conversations
- ✅ Conversation history persistence

### UI/UX Improvements
- ✅ Professional chat interface
- ✅ Responsive design for all devices
- ✅ Dark/light theme toggle
- ✅ Loading states and animations
- ✅ Proper message formatting (markdown, code, charts)

### API Integration
- ✅ Robust Dify API integration
- ✅ Proper streaming response handling
- ✅ Error handling and retry logic
- ✅ Environment variable configuration

## 🎯 Key Features

1. **Smart Chat Interface**
   - Professional financial assistant UI
   - Real-time streaming responses
   - Markdown rendering for rich text

2. **Conversation Management**
   - Auto-generated conversation titles
   - Persistent chat history
   - Search and filter capabilities

3. **Advanced Content Support**
   - Chart visualization
   - Code syntax highlighting
   - Image display
   - File upload (ready for implementation)

4. **Professional UX**
   - Responsive design
   - Dark/light themes
   - Loading states
   - Error handling

## 🔧 Troubleshooting

### Common Issues

1. **API Connection Failed**
   ```bash
   npm run test-api
   ```
   Check the output and verify your Dify credentials.

2. **Title Generation Not Working**
   - Check browser console for errors
   - Verify API key has proper permissions
   - Ensure Dify instance is accessible

3. **Messages Not Sending**
   - Check network connectivity
   - Verify Dify app is configured for chat
   - Check browser console for errors

### Debug Mode

Add to `.env.local`:
```env
DEBUG=true
NODE_ENV=development
```

## 📚 Next Steps

1. **Customize the UI** - Modify colors, branding, and layout
2. **Add Features** - Implement file upload, voice input, etc.
3. **Deploy** - Deploy to production environment
4. **Integrate** - Connect with external data sources

## 🆘 Need Help?

1. Check the [full setup guide](setup.md)
2. Review the [README](README.md)
3. Check browser console for errors
4. Test API connection with `npm run test-api`

---

**Ready to chat! 🎉** 