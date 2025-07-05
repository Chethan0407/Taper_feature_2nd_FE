# TapeOutOps - Streamline Your Tapeout Workflow

A modern, dark-themed frontend application for managing semiconductor tapeout workflows, built with Vue 3, Vite, and Tailwind CSS.

## 🎯 Features

### 🔐 Authentication
- Secure login with email/password
- Google SSO integration
- JWT token management
- Role-based access control

### 📘 Specifications Management
- Upload and manage spec files (PDF, DOCX, PPT, XLS)
- Version history and comparison
- Inline spec preview
- Status tracking (Draft, Review, Approved)
- Assign reviewers and track approvals

### ✅ Checklist Automation
- Create reusable checklist templates
- Assign checklists to projects/specs
- Multi-level approval workflows (Lead → Manager → Foundry)
- Due date tracking and reminders
- Export checklists as PDF

### 🧾 SpecLint Engine
- Automated spec quality validation
- Custom rule builder
- Keyword detection and validation
- Date format checking
- NDA clause verification
- Export lint results

### 🧑‍💼 Vendor Management
- Vendor partner onboarding
- NDA and contract file management
- Communication timeline tracking
- Response time monitoring
- Spec acknowledgment tracking

### ⚙️ Settings & Administration
- User roles and permissions
- API key generation and management
- Notification preferences
- Company branding customization
- Audit trail logging

## 🛠️ Tech Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Pinia
- **Routing**: Vue Router
- **Icons**: Lucide Vue
- **UI Components**: Headless UI
- **TypeScript**: Full type safety

## 🎨 Design System

### Colors
- **Primary**: Neon blue (#00d4ff) with purple accents
- **Background**: Dark theme (#0E0E0E base)
- **Glassmorphism**: Translucent cards with backdrop blur
- **Status Colors**: Green (success), Yellow (warning), Red (error)

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono
- **Gradients**: Text gradients for branding

### Components
- Glass-effect cards with backdrop blur
- Neon glow effects on hover
- Smooth transitions and animations
- Mobile-first responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tapeout-ops
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   └── Layout/
│       ├── Sidebar.vue
│       └── Header.vue
├── views/
│   ├── LoginPage.vue
│   ├── DashboardPage.vue
│   ├── SpecsPage.vue
│   ├── ChecklistsPage.vue
│   ├── SpecLintPage.vue
│   ├── VendorsPage.vue
│   └── SettingsPage.vue
├── stores/
│   └── auth.ts
├── router/
│   └── index.ts
├── style.css
├── main.ts
└── App.vue
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=TapeOutOps
```

### Tailwind Configuration
Custom colors and animations are defined in `tailwind.config.js`:

- Dark theme colors
- Neon accent colors
- Custom animations (glow, pulse)
- Glassmorphism utilities

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- Vue 3 Composition API
- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code quality
- Prettier for formatting

## 🔐 Authentication Flow

1. User enters credentials on login page
2. Credentials validated against backend
3. JWT token stored in localStorage
4. Token validated on each route change
5. Automatic logout on token expiration

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Sidebar collapses on mobile
- Touch-friendly interactions

## 🎯 Future Enhancements

### Microfrontend Architecture
- Module Federation for independent module deployment
- Shared component library
- Independent CI/CD pipelines

### Advanced Features
- Real-time collaboration
- Advanced search and filtering
- AI-powered spec suggestions
- Integration with design tools
- Advanced analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**TapeOutOps** - Streamlining semiconductor tapeout workflows with modern web technology. 