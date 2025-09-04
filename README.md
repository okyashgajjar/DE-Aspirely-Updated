# Virtual Career Advisor

A production-level frontend-only web application built with HTML, CSS, JavaScript (ES6), and GSAP animations. This AI-powered career guidance platform helps users find job opportunities, develop skills, and advance their careers.

## 🚀 Features

- **AI Career Chatbot** - Interactive chat with intelligent responses
- **Job Recommendations** - Personalized job matching based on skills and preferences
- **Career Analytics** - Visual charts and insights for career progress
- **Skill Development** - Curated courses and learning paths
- **Voice Assistant** - Hands-free career guidance using Web Speech API
- **Profile Management** - Comprehensive user profile with onboarding wizard
- **Responsive Design** - Mobile-first approach with smooth animations

## 🛠️ Technologies Used

- **HTML5** - Semantic markup and modern structure
- **CSS3** - Custom properties, Grid, Flexbox, and responsive design
- **JavaScript ES6** - Modern JavaScript with modules and localStorage
- **GSAP** - Professional animations and transitions
- **Web Speech API** - Voice recognition and synthesis

## 📁 Project Structure

```
Virtual Career Advisor/
├── index.html              # Home page
├── login.html              # Login page
├── signup.html             # Registration page
├── onboarding.html         # Multi-step onboarding wizard
├── dashboard.html          # Main dashboard
├── chat.html               # AI chatbot interface
├── recommendations.html    # Job recommendations
├── analytics.html          # Career analytics and charts
├── voice.html              # Voice assistant
├── courses.html            # Course recommendations
├── profile.html            # User profile management
├── css/
│   └── styles.css          # Main stylesheet with CSS variables
└── js/
    ├── main.js             # Common utilities and animations
    ├── auth.js             # Authentication logic
    ├── onboarding.js       # Onboarding wizard
    ├── dashboard.js        # Dashboard functionality
    ├── chat.js             # Chatbot logic
    ├── recommendations.js  # Job recommendations
    ├── analytics.js        # Analytics and charts
    ├── voice.js            # Voice assistant
    ├── courses.js          # Course management
    └── profile.js          # Profile management
```

## 🚀 Getting Started

1. **Clone or download** the project files
2. **Open `index.html`** in a modern web browser
3. **Start exploring** the application!

### Demo Login Credentials

Use these credentials to test the application:

**Demo User:**
- Email: `demo@career.ai`
- Password: `Demo@123`

**Admin User:**
- Email: `admin@career.ai`
- Password: `Admin@123`

## 🎯 How to Use

### 1. **Home Page** (`index.html`)
- View features and animations
- Click "Get Started Free" or "Login"

### 2. **Authentication**
- **Sign Up**: Create a new account
- **Login**: Use demo credentials or create account
- **Demo Login**: Click "Login with Demo Account" for instant access

### 3. **Onboarding** (`onboarding.html`)
- Complete 12-step profile setup
- Add personal information, skills, and career preferences
- Data is saved to localStorage

### 4. **Dashboard** (`dashboard.html`)
- View personalized recommendations
- Quick access to all features
- Track profile completion

### 5. **AI Chatbot** (`chat.html`)
- Ask career-related questions
- Get instant AI responses
- Use suggestion buttons for quick queries

### 6. **Job Recommendations** (`recommendations.html`)
- Browse personalized job matches
- Filter by location, experience, and salary
- View required vs missing skills

### 7. **Career Analytics** (`analytics.html`)
- View job demand trends
- Track salary progression
- Monitor skill demand

### 8. **Voice Assistant** (`voice.html`)
- Speak naturally to get career advice
- Adjust voice speed and pitch
- View conversation transcript

### 9. **Courses** (`courses.html`)
- Browse skill development courses
- Filter by skill, difficulty, and duration
- Follow structured learning paths

### 10. **Profile** (`profile.html`)
- Edit personal information
- Manage skills and preferences
- Track profile completion

## 🎨 Design Features

- **CSS Variables** - Consistent theming and easy customization
- **Mobile-First** - Responsive design for all devices
- **GSAP Animations** - Smooth transitions and micro-interactions
- **Modern UI** - Clean, professional interface
- **Accessibility** - Semantic HTML and keyboard navigation

## 🔧 Customization

### Colors and Theming
Edit CSS variables in `css/styles.css`:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #f59e0b;
    --accent-color: #10b981;
    /* ... more variables */
}
```

### Adding New Features
1. Create new HTML page
2. Add corresponding JavaScript file
3. Include in main.js initialization
4. Add navigation links

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

**Note**: Voice features require HTTPS in production or localhost for development.

## 🚀 Performance

- **Lightweight** - No external dependencies except GSAP
- **Fast Loading** - Optimized CSS and JavaScript
- **Smooth Animations** - Hardware-accelerated GSAP animations
- **Responsive** - Mobile-first design with efficient layouts

## 📝 Data Storage

All user data is stored in browser's localStorage:
- User authentication
- Profile information
- Onboarding data
- Skills and preferences

## 🎯 Future Enhancements

- Backend integration
- Real job data APIs
- Advanced analytics
- Social features
- Mobile app version

## 📄 License

This project is for demonstration purposes. Feel free to use and modify as needed.

---

**Built with ❤️ using modern web technologies**
