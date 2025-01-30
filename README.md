# Tonestar

Tonestar is a web-based song-writing and song-generation application built with **Next.js** and **Tone.js** that allows users to play chords, generate songs using user-provided song ideas and chords as input, and interact with musical data. It leverages the power of modern web technologies and LLMs to provide an immersive, high-performance audio experience with easy-to-use controls.

## Features

- **Audio Playback**: Users can play chords, and the application will trigger corresponding piano sounds.
- **Real-Time Sound Generation**: Using **Tone.js**, the app generates realistic piano sounds, with support for dynamic chord playback.
- **Sample-Based Sound Engine**: Piano sounds are loaded dynamically from audio samples stored in the `public/samples/` directory.

## Technologies Used

- **Next.js**: A React framework for building fast, static, and dynamic websites.
- **Tone.js**: A powerful audio framework used for creating and manipulating sounds directly in the browser.
- **Webpack**: A module bundler for JavaScript, used here to manage assets and optimize file loading.
- **React**: JavaScript library for building user interfaces, integrated with Next.js for a seamless experience.
- **TypeScript**: Used for better type safety and editor support.

## Installation

To get started with the project, follow the steps below.

### Prerequisites

Ensure that you have the following tools installed on your machine:

- **Node.js** (version 14 or higher)
- **npm** (Node package manager)
- **Next.js** (handled by the dependencies in the project)

### Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/tonestar.git
   cd tonestar
   ```

2. **Install the dependencies**:

   Run the following command to install all the necessary dependencies for the project:

   ```bash
   npm install
   ```

3. **Run the development server**:

   To start the application in development mode, use the following command:

   ```bash
   npm run dev
   ```

   The app will now be accessible at `http://localhost:3000`.

## How It Works

1. **Audio Engine Initialization**:
   - The app requests audio permission using `Tone.start()` and initializes the Tone.js audio context.
   - Piano samples are loaded from the `public/samples/` directory.
   - Audio files are dynamically fetched and played based on user interaction.

2. **Dynamic Sample Loading**:
   - Audio samples are loaded dynamically when needed, reducing memory usage and ensuring that only necessary files are loaded into the application.

3. **Chord Playback**:
   - Users can trigger chords, and the app will simulate the piano sound by triggering the corresponding piano notes.
   - The chord is played in sequence, and a duration parameter determines how long the chord is sustained.

## Usage

Once the app is running, users can interact with the piano by pressing the keyboard keys or clicking on the piano keys on the UI. The following features are available:

- **Play Chords**: Users can play chords by pressing corresponding keys or triggering a chord programmatically.
- **Stop Notes**: The app allows users to stop all notes playing at once.
- **Dynamic Playback**: The app supports dynamic loading and playback of piano samples, reducing resource usage by loading only the required files.

## Troubleshooting

- **Insufficient resources error**: If you encounter memory-related errors such as "Insufficient resources," ensure that you are running the app with sufficient memory allocation. Consider increasing the `--max-old-space-size` option for Node.js.
- **Network errors when fetching samples**: Ensure that the path to the sample files in the `public/samples/` directory is correct and that the files are accessible.

## Contributing

If you’d like to contribute to the project, feel free to open an issue or submit a pull request. Contributions are welcome, and we encourage improvements or bug fixes.

1. Fork the repository
2. Create a new branch
3. Make your changes and commit
4. Push to your fork
5. Create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.