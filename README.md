# CPDL Debate Simulator

A rich interactive web application that simulates Canadian Parliamentary Debate (CPDL) format debates using AI agents. The application features 4 AI-controlled debaters (PM, LO, MO, PW) that engage in structured debates following CPDL rules, with streaming text output, TTS voice synthesis, and detailed judge-like commentary post-debate. Designed primarily for competitive debaters to practice and analyze debate techniques.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Development](#development)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Debate Mechanics
- **4 CPDL Roles**: Prime Minister (PM), Leader of Opposition (LO), Member of Opposition (MO), Private Whip (PW)
- **Rule Enforcement**: Strict adherence to CPDL format rules with proper timing and role-specific constraints
- **Timed Rounds**: PM (7min), LO (8min), MO (4min), PW (4min) with real-time countdown timers
- **POI System**: Points of Information mechanism during non-protected time periods
- **Motion Input**: Debate motion validation in "This House believes that..." format

### AI-Powered Debaters
- **Smart Agents**: Each role has an AI agent that generates contextually appropriate responses
- **Role-Specific Behavior**: Agents follow role-appropriate patterns and argumentation styles
- **Context Awareness**: AI maintains debate context and builds upon previous arguments
- **Real-time Generation**: Streaming text generation as the debate unfolds

### Streaming & Audio
- **Real-time Text Streaming**: See text appear incrementally as AI generates content
- **TTS Voice Synthesis**: Each role has a distinct voice characteristic (pitch, tone, etc.)
- **Audio Controls**: Volume, playback rate, mute, and enable/disable controls
- **Synchronization**: Streaming text and audio are synchronized for natural feel
- **Low Latency**: Optimized TTS processing for natural debate rhythm

### Visual Feedback & UI
- **Dashboard Interface**: Clear display of current speaker and remaining time
- **Distinct Styling**: Each debater's text displayed with distinct colors for easy identification
- **Real-time Updates**: Smooth transitions as debate progresses
- **Visual Indicators**: Flow indicators showing debate progress and current phase
- **Responsive Design**: Works on various screen sizes

### Post-Debate Analysis
- **Judge Commentary**: Detailed narrative feedback explaining strengths and weaknesses
- **Numerical Scoring**: Percentage-based scores (0-100%) across 5 evaluation criteria
- **5 Criteria Evaluation**: Content, rebuttal, POI handling, delivery, teamwork
- **Side-by-Side Comparison**: All four speakers displayed for easy comparison
- **Progress Visualization**: Progress bars for intuitive score representation
- **Rankings**: 1st-4th place with tie handling for close scores
- **Specific Examples**: Quotes from transcript to justify assessments

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Python (for backend if using local processing)
- API key for DeepSeekV3 or other AI provider

### Frontend Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd debate-simulator
```

2. Install frontend dependencies:
```bash
npm install
```

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your API keys:
```env
DEEPSEEKV3_API_KEY=your_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
TTS_PROVIDER=deepseek  # or 'elevenlabs' or 'pyttsx3'
```

## Usage

### Running the Application

#### Frontend Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

#### Backend Server
```bash
cd backend
python main.py
```

#### Full Stack Development
1. Start the backend server first
2. Start the frontend development server
3. The frontend will automatically connect to the backend API

### Starting a Debate
1. Enter a debate motion in the format "This House believes that..."
2. Click the "Start Debate" button
3. Watch as the 4 AI agents engage in a structured debate
4. Listen to the audio with distinct voices for each role
5. Review the detailed post-debate feedback and scoring

### Audio Controls
- Adjust volume using the volume slider
- Control playback speed with the rate slider
- Toggle mute/unmute with the speaker button
- Enable/disable audio with the power button

## Architecture

### Frontend Architecture
- **React 18.2**: Modern component-based UI framework
- **TypeScript**: Strong typing for enhanced reliability
- **Zustand**: State management for debate state, audio state, and streaming
- **Tailwind CSS**: Utility-first styling framework
- **Vite**: Fast build tool and development server

### Backend Architecture
- **Python FastAPI**: High-performance web framework
- **Async Processing**: Streaming AI generation with proper cleanup
- **TTS Integration**: Flexible TTS provider support (pyttsx3, ElevenLabs, etc.)
- **API Endpoints**: RESTful API for frontend communication

### Core Components

#### Frontend Components
- `DebateDashboard`: Main dashboard component coordinating all UI elements
- `SpeakerCard`: Displays current speaker with role-specific styling
- `TranscriptPanel`: Shows the debate transcript in real-time
- `TimerDisplay`: Real-time timer for current speaker
- `POIControls`: Controls for managing Points of Information
- `AudioControls`: Volume, rate, and playback controls
- `JudgeScorecard`: Post-debate scoring and feedback display

#### State Management
- `debateStore`: Centralized state for debate progress, timers, and transcript
- `audioStore`: Audio state management with volume, rate, and mute controls
- `voiceRegistry`: Role-to-voice mapping for distinct audio characteristics

#### Hooks
- `useDebateTimer`: Timer functionality with start/pause/reset
- `useTTS`: TTS integration with role-based voice selection
- `useAudioControls`: Audio control state management
- `useStreamingText`: Streaming text accumulation with throttling

## Technology Stack

### Frontend
- **Framework**: React 18.2
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Testing**: Jest, React Testing Library (planned)

### Backend
- **Framework**: FastAPI (Python)
- **AI Integration**: DeepSeekV3 API, ElevenLabs (for TTS)
- **TTS**: pyttsx3 (local), ElevenLabs (cloud)
- **WebSockets**: Real-time streaming (if needed)

### Audio & Media
- **Web Audio API**: For advanced audio processing
- **GainNode**: For smooth volume transitions
- **Progress Components**: Accessible progress bars for scores

## Development

### Available Scripts

#### Frontend Scripts
- `npm run dev`: Starts the development server
- `npm run build`: Builds the production-ready application
- `npm run lint`: Runs ESLint to check for code issues
- `npm run preview`: Locally preview the production build

#### Project Structure
```
├── backend/
│   ├── main.py
│   ├── src/
│   │   ├── debate.py
│   │   ├── tts.py
│   │   └── config.py
│   └── requirements.txt
├── src/
│   ├── components/
│   │   ├── judge/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   ├── store/
│   ├── types/
│   └── App.tsx
├── public/
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Adding New Features
1. Create new components in the appropriate directory
2. Add type definitions in `src/types/`
3. Update state management in appropriate stores
4. Create new hooks if needed in `src/hooks/`
5. Write tests for new functionality
6. Update documentation as needed

## Project Structure

### Frontend Structure
```
src/
├── components/
│   ├── judge/          # Judge commentary components
│   ├── ui/            # Reusable UI components
│   └── ...            # Other feature components
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries and business logic
├── store/             # Zustand stores
├── types/             # TypeScript type definitions
├── App.tsx            # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

### Backend Structure
```
backend/
├── main.py            # FastAPI application entry point
├── src/
│   ├── debate.py      # Debate logic and AI integration
│   ├── tts.py         # Text-to-speech functionality
│   └── config.py      # Configuration and settings
└── requirements.txt   # Python dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Style Guidelines
- Follow TypeScript/JavaScript best practices
- Maintain consistent naming conventions
- Write comprehensive JSDoc comments for exported functions
- Keep components focused and reusable
- Follow accessibility best practices

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the repository or contact the project maintainers.

---

**CPDL Debate Simulator v1.0**  
A comprehensive tool for competitive debaters to practice realistic CPDL debates against AI opponents that strictly follow debate rules and provide sophisticated feedback.