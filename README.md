# Suspicious Alarm Clock 🎯

## Basic Details

### Team Name: [Add your team name]

### Team Members
- Team Lead: [Name] - [College]
- Member 2: [Name] - [College]
- Member 3: [Name] - [College]

### Project Description
An alarm clock that treats you as the intruder. Set a time, start your webcam, and arm the brass switch — after the set time, any motion in front of your desk rings a synthesized brass bell until you click anywhere to silence it. Frames never leave your machine.

### The Problem (that doesn't exist)
Regular alarm clocks only ring at one fixed moment and then give up. But what about the truly urgent scenario where you need your computer to keep staring at your empty chair and scream the instant your cat, roommate, or future self wanders back into frame? Existing clocks fail to be adequately suspicious. This is clearly a crisis.

### The Solution (that nobody asked for)
A web app styled like a vintage brass desk instrument that:
1. Watches your desk through your webcam (locally, pixel-by-pixel — nothing is recorded or uploaded)
2. Waits until your set time passes
3. Rings a fully synthesized WebAudio brass bell the moment any motion is detected
4. Demands you click a full-screen "RING RING" overlay to be forgiven

It even has a brass lever switch you must physically flip to arm it, because a suspicious alarm deserves a suspicious amount of ceremony.

## Technical Details

### Technologies/Components Used

For Software:
- [Languages used]: TypeScript, HTML, CSS
- [Frameworks used]: React 19, Vite, React Router v7
- [Libraries used]: Tailwind CSS v4, shadcn/ui, Framer Motion, Lucide Icons, Convex + Convex Auth (backend/database/auth), Web Audio API (bell synthesis), Canvas + MediaDevices API (motion detection)
- [Tools used]: Bun, Convex dev server

For Hardware:
- Not applicable — this is a purely software project
- [Main components]: Any device with a webcam and a browser
- [Specifications]: A webcam, a speaker, and the courage to be surveilled by your own computer
- [Tools required]: None beyond the browser

### Implementation

For Software:

**Installation**
```bash
bun install
```

**Run**
```bash
bun run dev
```
Then open the app, choose an alarm time, press **Start camera**, and flip the **surveillance switch** to arm it. Step away from your desk. After the set time, motion rings the bell — click anywhere on the overlay to silence it.

### Project Documentation

For Software:

**Screenshots (Add at least 3)**

![Screenshot1](Add screenshot 1 here with proper name)
*The landing page: a vintage brass & ink desk-instrument aesthetic with a live ticking clock face.*

![Screenshot2](Add screenshot 2 here with proper name)
*The armed clock page: alarm time input, brass lever switch, camera panel with live motion-level meter, and the analog dial showing "ALARM hh:mm".*

![Screenshot3](Add screenshot 3 here with proper name)
*The alarm firing: full-screen "RING RING — Motion has been detected in the study" overlay that must be clicked to silence.*

**Diagrams**

![Workflow](Add your workflow/architecture diagram here)
*Flow: Set time → Start camera → Arm switch → Clock ticks until the set time → Surveillance goes live → Canvas pixel-diff loop computes a motion level each frame → Motion above threshold → WebAudio bell rings + overlay appears → Click anywhere → Alarm discharged.*

For Hardware:

Not applicable — purely software.

**Schematic & Circuit**
N/A

**Build Photos**
N/A

### Project Demo

**Video**
[Add your demo video link here]
*The video demonstrates setting the alarm, arming the switch, stepping out of frame, and the bell ringing the moment motion reappears — then silencing it with a click.*

**Additional Demos**
[Add any extra demo materials/links]

## Team Contributions
- [Name 1]: [Specific contributions]
- [Name 2]: [Specific contributions]
- [Name 3]: [Specific contributions]

**Made with ❤️ at TinkerHub Useless Projects**
