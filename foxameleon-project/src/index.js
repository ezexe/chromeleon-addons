// // Import the web-ext module
import webExt from "web-ext";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";

// Paths (update these paths to match your environment)
const sourceDir = path.resolve(
  'C:/repos/chromeleon-addons/src/Chameleon.app.Addons/Assets/addons/foxameleon'
);
const artifactsDir = path.join(sourceDir, "web-ext-artifacts");
const firefoxPath = path.resolve(
  "C:/Program Files/Mozilla Firefox/firefox.exe"
);
const profileDir = path.resolve("C:/temp/firefox-profile");
const extensionsDir = path.join(profileDir, "extensions");

// Ensure the artifacts directory exists
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

// Ensure the profile and extensions directories exist
if (!fs.existsSync(extensionsDir)) {
  fs.mkdirSync(extensionsDir, { recursive: true });
}

webExt.cmd.run({
  sourceDir: sourceDir,
  firefox: firefoxPath,
  firefoxProfile: profileDir,
  artifactsDir: artifactsDir,
  startUrl: ["https://www.browserleaks.com"],
  verbose: true,
  devtools: true,
  browserConsole: true,
  noInput: true,
  noReload: true,
  preInstall: false,
  profileCreateIfMissing: true,
  pref: {
    "privacy.fingerprintingProtection.overrides": "+JSDateTimeUTC"
  },
}).then((runner) => {
  console.log('Addon launched successfully!');
  // runner.exit();
}).catch((error) => {
  console.error('Error launching addon:', error);
  if (error.stack) {
    console.error('Stack trace:', error.stack);
  }
});

 // Build the extension
// webExt.cmd.build({
//   sourceDir: sourceDir,
//   artifactsDir: artifactsDir,
//   overwriteDest: true, // Overwrite existing files
//   filename: 'foxameleon.xpi', // Specify the output filename
// }).then(() => {
//   console.log('Addon built successfully!');

//   // Copy the .xpi file to the extensions directory
//   const xpiSource = path.join(artifactsDir, 'foxameleon.xpi');
//   const xpiDest = path.join(extensionsDir, 'foxameleon@chameleon.app.xpi'); // Use your extension's ID
//   fs.copyFileSync(xpiSource, xpiDest);
//   console.log('Copied .xpi to extensions directory:', xpiDest);

//   // Create user.js file to enable extension loading from the profile and disable signature requirement
//   const userJsPath = path.join(profileDir, 'user.js');
//   const userJsContent = `
// user_pref("extensions.autoDisableScopes", 0);
// user_pref("extensions.enabledScopes", 15);
// user_pref("xpinstall.signatures.required", false);
// `;
//   fs.writeFileSync(userJsPath, userJsContent);
//   console.log('Created user.js file at:', userJsPath);

//   // Launch Firefox Developer Edition with the profile
//   const firefoxArgs = [
//     '-no-remote',
//     '-profile',
//     profileDir,
//     'https://www.browserleaks.com',
//   ];

//   const child = execFile(firefoxPath, firefoxArgs, (error) => {
//     if (error) {
//       console.error('Error launching Firefox:', error);
//     } else {
//       console.log('Firefox launched successfully!');
//     }
//   });

//   // (Optional) Handle child process events
//   child.on('close', (code) => {
//     console.log(`Firefox exited with code ${code}`);
//   });
// }).catch((error) => {
//   console.error('Error building addon:', error);
// });


// webExt.cmd.run({
//   sourceDir: 'C:/repos/chromeleon-addons/src/Chameleon.app.Addons/Assets/addons/foxameleon',
//   firefox: 'C:/Program Files/Mozilla Firefox/firefox.exe',
//   startUrl: ["https://www.browserleaks.com"],
//   noReload: true,
//   noInput: true,
// }).then((runner) => {
//   console.log('Addon launched successfully!');
//     runner.exit();
// }).catch((error) => {
//   console.error('Error launching addon:', error);
// });

