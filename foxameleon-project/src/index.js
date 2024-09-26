// Import the web-ext module
import webExt from 'web-ext';

// Define the options for launching the addon
const options = {
  sourceDir: 'C:\\repos\\chromeleon-addons\\src\\Chameleon.app.Addons\\Assets\\addons\\foxameleon',
};

console.log('Starting web-ext with options:', JSON.stringify(options, null, 2));

// Launch the addon using web-ext
webExt.cmd.run({
  sourceDir: options.sourceDir,
  //add --no-notification to avoid the notification popup
  args: ['--no-notification'],
}).then(() => {
  console.log('Addon launched successfully!');
}).catch((error) => {
  console.error('Error launching addon:', error);
  if (error.stack) {
    console.error('Stack trace:', error.stack);
  }
});