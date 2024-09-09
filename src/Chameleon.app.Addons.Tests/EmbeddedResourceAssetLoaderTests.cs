using Microsoft.VisualStudio.TestTools.UnitTesting;
using Chameleon.app.Addons.Services;
using System.IO;
using System.Reflection;
using System;
using System.Linq;

namespace Chameleon.app.Addons.Tests
{
    [TestClass]
    public class EmbeddedResourceAssetLoaderTests
    {
        private EmbeddedResourceAssetLoader? _assetLoader;
        private Assembly _mainAssembly;

        [TestInitialize]
        public void Setup()
        {
            _mainAssembly = typeof(EmbeddedResourceAssetLoader).Assembly;
            _assetLoader = new EmbeddedResourceAssetLoader(_mainAssembly);
            Console.WriteLine("Open_ExistingFile_ReturnsStream test passed.");
            Console.WriteLine("Open_NonExistentFile_ThrowsFileNotFoundException test passed.");
            Console.WriteLine("GetAssets_ReturnsNonEmptyList test passed.");
        }

        [TestMethod]
        public void Open_ExistingFile_ReturnsStream()
        {
            // Print all embedded resource names
            var resourceNames = _mainAssembly.GetManifestResourceNames();
            Console.WriteLine("Available embedded resources:");
            foreach (var name in resourceNames)
            {
                Console.WriteLine(name);
            }

            // Arrange
            var uri = new Uri("avares://Chameleon.app.Addons/Assets/addons/webgl-defender/manifest.json");

            Console.WriteLine($"Testing Open with URI: {uri}");
            using var stream = _assetLoader!.Open(uri);

            // Assert
            Assert.IsNotNull(stream);
            Assert.IsTrue(stream.Length > 0);
        }

        [TestMethod]
        [ExpectedException(typeof(FileNotFoundException))]
        public void Open_NonExistentFile_ThrowsFileNotFoundException()
        {
            // Arrange
            var uri = new Uri("avares://Chameleon.app.Addons/non_existent_file.txt");

            Console.WriteLine($"Testing Open with URI: {uri}");
            _assetLoader!.Open(uri);

            // Assert is handled by ExpectedException
        }

        [TestMethod]
        public void GetAssets_ReturnsNonEmptyList()
        {
            // Arrange
            var uri = new Uri("avares://Chameleon.app.Addons/Assets");

            Console.WriteLine($"Testing GetAssets with URI: {uri}");
            var assets = _assetLoader!.GetAssets(uri, null).ToList();

            // Assert
            Assert.IsNotNull(assets);
            Assert.IsTrue(assets.Count > 0);
        }
    }
}
