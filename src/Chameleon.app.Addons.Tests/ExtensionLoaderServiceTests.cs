using Microsoft.VisualStudio.TestTools.UnitTesting;
using Chameleon.app.Addons.Services;
using Chameleon.app.Addons.Models;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Threading.Tasks;
using System.IO;

namespace Chameleon.app.Addons.Tests
{
    [TestClass]
    public class ExtensionLoaderServiceTests
    {
        private Mock<ILogger<ExtensionLoaderService>>? _mockLogger;
        private ExtensionLoaderService? _extensionLoaderService;

        [TestInitialize]
        public void Setup()
        {
            _mockLogger = new Mock<ILogger<ExtensionLoaderService>>();
            _extensionLoaderService = new ExtensionLoaderService(_mockLogger.Object);
        }

        [TestMethod]
        public async Task LoadExtension_ValidExtension_Succeeds()
        {
            // Arrange
            var extensionType = ExtensionType.chromeleon_addon;
            var destinationPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
            var settings = "{}";

            Console.WriteLine($"Testing LoadExtension with destination path: {destinationPath}");
            try
            {
                // Check if the resource exists
                var resourceNames = typeof(EmbeddedResourceAssetLoader).Assembly.GetManifestResourceNames();
                Console.WriteLine("Available embedded resources:");
                foreach (var name in resourceNames)
                {
                    Console.WriteLine(name);
                }

                // Act
                await _extensionLoaderService!.LoadExtension(extensionType, destinationPath, settings);

                // Assert
                var dest = Path.Combine(destinationPath, extensionType.ToString());
                Assert.IsTrue(Directory.Exists(dest), $"Destination path does not exist: {dest}");

                var manifestPath = Path.Combine(dest, "manifest.json");
                Assert.IsTrue(File.Exists(manifestPath), $"Manifest file does not exist: {manifestPath}");

                var iconsPath = Path.Combine(dest, "data", "icons");
                Assert.IsTrue(Directory.Exists(iconsPath), $"Icons directory does not exist: {iconsPath}");

                // Print directory structure
                Console.WriteLine("Directory structure:");
                PrintDirectoryStructure(destinationPath, "");
            }
            finally
            {
                // Clean up
                if (Directory.Exists(destinationPath))
                {
                    Directory.Delete(destinationPath, true);
                }
            }
        }

        private void PrintDirectoryStructure(string path, string indent)
        {
            Console.WriteLine($"{indent}{Path.GetFileName(path)}\\");
            foreach (var file in Directory.GetFiles(path))
            {
                Console.WriteLine($"{indent}  {Path.GetFileName(file)}");
            }
            foreach (var dir in Directory.GetDirectories(path))
            {
                PrintDirectoryStructure(dir, indent + "  ");
            }
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentNullException))]
        public async Task LoadExtension_NullDestinationPath_ThrowsArgumentNullException()
        {
            // Arrange
            var extensionType = ExtensionType.chromeleon_addon;
            string destinationPath = null!;
            var settings = "{}";

            // Act
            await _extensionLoaderService!.LoadExtension(extensionType, destinationPath, settings);

            // Assert is handled by ExpectedException
        }

        // Add more test methods as needed
    }
}
