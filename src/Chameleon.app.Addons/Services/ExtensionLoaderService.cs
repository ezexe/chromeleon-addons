using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Chameleon.app.Addons.Models;
using Chameleon.app.Addons.Util;
using Microsoft.Extensions.Logging;

namespace Chameleon.app.Addons.Services
{
    public class ExtensionLoaderService(ILogger<ExtensionLoaderService> logger) : IExtensionLoaderService
    {
        private readonly ILogger<ExtensionLoaderService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        private readonly IAssetLoader _assetLoader = new EmbeddedResourceAssetLoader(typeof(EmbeddedResourceAssetLoader).Assembly);
        private const string AddonsBasePath = "avares://Chameleon.app.Addons/Assets/addons";

        public async Task LoadExtension(ExtensionType extensionType, string destinationPath, string settings)
        {
            try
            {
                var extensionName = extensionType.ToString();
                var assetUri = new Uri($"{AddonsBasePath}/{extensionName}");
                var assets = _assetLoader.GetAssets(assetUri, null).ToList();

                foreach (var asset in assets)
                {
                    var authorityParts = asset.Authority.Split('.');
                    var relativePath = IOUtil.GetRelativePathFromAuthority(authorityParts, extensionName);

                    await IOUtil.CopyFromStream(
                        _assetLoader.OpenAsset(asset),
                        destinationPath, relativePath,
                        relativePath.EndsWith("background.js") ? settings : null);
                }

                _logger.LogInformation("Extension {extensionType} loaded successfully to {destinationPath}", extensionType, destinationPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading extension {extensionType}", extensionType);
                throw;
            }
        }

        private async Task CopyIcons(string destinationPath)
        {
            var iconsDir = Path.Combine(destinationPath, "data", "icons");
            await IOUtil.CreateDirectory(iconsDir);

            var localpath = "avares://Chameleon.app.Addons/Assets/logo_symbol.iconset";
            var iconSizes = new Dictionary<string, string>
            {
                { "16", "icon_16x16.png" },
                { "32", "icon_32x32.png" },
                { "64", "icon_32x32@2x.png" },
                { "128", "icon_128x128.png" },
                { "256", "icon_256x256.png" },
                { "512", "icon_512x512.png" }
            };

            foreach (var (size, fileName) in iconSizes)
            {
                await IOUtil.CopyFromStream(
                    _assetLoader.Open(new Uri($"{localpath}/{fileName}")),
                    iconsDir, $"{size}.png");
            }
        }
    }
}