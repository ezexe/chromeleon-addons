// Import the web-ext module
import webExt from 'web-ext';

// Launch the addon using web-ext
webExt.cmd.run({
  sourceDir: 'C:\\repos\\chromeleon-addons\\src\\Chameleon.app.Addons\\Assets\\addons\\foxameleon',
  startUrl: ["https://www.browserleaks.com"],
  browserConsole: true,
  verbose: true,     // Enable verbose logging
  devtools: true,    // Open DevTools automatically
}).then(() => {
  console.log('Addon launched successfully!');
}).catch((error) => {
  console.error('Error launching addon:', error);
  if (error.stack) {
    console.error('Stack trace:', error.stack);
  }
});