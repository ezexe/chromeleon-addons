using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Chameleon.app.Addons.Util
{
    internal static class IOUtil
    {
        internal static Task CreateDirectory(string path)
        {
            return Task.Run(() =>
            {
                if (!Directory.Exists(path))
                {
                    Directory.CreateDirectory(path);
                }
            });
        }

        internal static async Task CopyFromStream(Stream inputStream, string targetDir, string relativePath, string? header = null)
        {
            ArgumentNullException.ThrowIfNull(inputStream);

            var desPath = Path.Combine(targetDir, relativePath);
            var destDir = Path.GetDirectoryName(desPath);
            ArgumentNullException.ThrowIfNull(destDir);

            await CreateDirectory(destDir);

            var tempFilePath = Path.GetTempFileName();
            try
            {
                using (var tempFileStream = new FileStream(tempFilePath, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    if (!string.IsNullOrEmpty(header))
                    {
                        var headerBytes = System.Text.Encoding.UTF8.GetBytes(header);
                        await tempFileStream.WriteAsync(headerBytes);
                    }

                    await inputStream.CopyToAsync(tempFileStream);
                }

                File.Copy(tempFilePath, desPath, true);
            }
            finally
            {
                File.Delete(tempFilePath);
            }
        }

        internal static string GetRelativePathFromAuthority(string[] authorityParts, string? relitiveTo = null)
        {
            var path = authorityParts.First().Replace('/', Path.DirectorySeparatorChar);
            //
            if (authorityParts.Length > 1)
            {
                var relativePath = string.Join("/", authorityParts.Take(authorityParts.Length - 1)) + "." + authorityParts.Last();
                path = relativePath.Replace('/', Path.DirectorySeparatorChar);
            }
            //
            if (relitiveTo != null)
                path = path[path.IndexOf(relitiveTo)..];
            //
            return path;
        }
    }
}
