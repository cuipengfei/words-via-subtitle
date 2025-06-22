using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Windows;
using System.Windows.Media;
using System.Xml.Linq;

namespace WordsViaSubtitle
{
    public partial class MainRibbonWindow
    {
        private BambookCore.TransCallback transCallBack;

        private void ExportToBambook_Click(object sender, RoutedEventArgs e)
        {
            if (transCallBack == null)
            {
                InitTranCallBack();
            }

            CleanTempFiles();
            //AdjustWindowToBambookResolution();
            CreateTempFiles();

            AddPrivateBookToDevice();
        }

        private void AdjustWindowToBambookResolution()
        {
            this.SizeToContent = SizeToContent.WidthAndHeight;
            mainArea.Arrange(new Rect(0, 0, 600, 800));
        }

        private void InitTranCallBack()
        {
            transCallBack = new BambookCore.TransCallback((status, progress, intPtr) =>
            {
                Dispatcher.BeginInvoke(new Action(() =>
                {
                    if (!busyIndicator.IsBusy)
                    {
                        busyIndicator.IsBusy = true;
                    }
                }));

                if (status == BambookCore.BambookTransState.transfering)
                {
                    Dispatcher.BeginInvoke(new Action(() =>
                    {
                        busyIndicator.BusyContent = string.Format("{0}%", progress);
                    }));
                }
                else if (status == BambookCore.BambookTransState.done)
                {
                    Dispatcher.BeginInvoke(new Action(() =>
                    {
                        if (busyIndicator.IsBusy)
                        {
                            busyIndicator.IsBusy = false;
                        }
                    }));
                    MessageBox.Show("Enjoy!.", "Done.", MessageBoxButton.OK, MessageBoxImage.Information);
                }
            });
        }

        private void CreateTempFiles()
        {
            XElement bodyElement = new XElement("body");
            XElement rootElement = new XElement("snbc",
                new XElement("head",
                    new XElement("title",
                        new XCData("单词集解"))),
                bodyElement);

            this.Topmost = true;
            wordsCollection.ForEach((word) =>
            {
                wordsListBox.SelectedValue = word;
                RefreshExplanationPresenter();
                ExtensionMethods.WaitFor(1.5);
                CreateBitmapFromVisual((Visual)mainArea.Content, Path.Combine(ExtensionMethods.CurrentFolder, @"Bambook\snbc\images\" + word + ".png"));

                bodyElement.Add(new XElement("text", new XCData(explanationProvidersManager.GetExplanationsInText(word))));
                bodyElement.Add(new XElement("img", word + ".png"));
            });
            this.Topmost = false;

            File.WriteAllText(Path.Combine(ExtensionMethods.CurrentFolder, @"Bambook\snbc\c1.snbc"), rootElement.ToString());
        }

        private void AddPrivateBookToDevice()
        {
            string snbFilePath = Path.Combine(ExtensionMethods.CurrentFolder, @"Bambook\WordsViaSubtitle.snb");
            BambookCore.BambookPackSnbFromDir(snbFilePath, Path.Combine(ExtensionMethods.CurrentFolder, @"Bambook"));

            uint connectionHandler = 0;
            BambookCore.BambookResult result = BambookCore.BambookConnect("192.168.250.2", 3000, ref connectionHandler);
            if (result == BambookCore.BambookResult.succeed)
            {
                BambookCore.BambookAddPrivBook(connectionHandler, snbFilePath, transCallBack, IntPtr.Zero);
            }
            else
            {
                MessageBox.Show("Please connect your Bambook with your computer and try again.", "Please try again.", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private static void CleanTempFiles()
        {
            Directory.GetFiles(Path.Combine(ExtensionMethods.CurrentFolder, @"Bambook"), "*.png", SearchOption.AllDirectories).ForEach(filePath =>
            {
                File.Delete(filePath);
            });
        }

        private void CreateBitmapFromVisual(Visual target, string filename)
        {
            if (target == null)
            {
                return;
            }

            Rect bounds = VisualTreeHelper.GetDescendantBounds(target);

            //if (true)
            //{
            //WebBrowser webBrowser = (WebBrowser)target;
            System.Windows.Point pointInWPF = target.PointToScreen(bounds.TopLeft);
            System.Drawing.Point pointInGDI = new System.Drawing.Point((int)pointInWPF.X, (int)pointInWPF.Y);
            Bitmap image = new Bitmap((int)bounds.Width, (int)bounds.Height);

            using (Graphics graphics = Graphics.FromImage(image))
            {
                graphics.CopyFromScreen(pointInGDI.X, pointInGDI.Y, 0, 0, new System.Drawing.Size((int)bounds.Width, (int)bounds.Height));
                image.Save(filename, ImageFormat.Png);
            }
            //}
            //else
            //{
            //    RenderTargetBitmap bitmap = new RenderTargetBitmap((int)bounds.Width, (int)bounds.Height, 96, 96, PixelFormats.Pbgra32);
            //    bitmap.Render(mainArea);

            //    PngBitmapEncoder image = new PngBitmapEncoder();
            //    image.Frames.Add(BitmapFrame.Create(bitmap));

            //    using (Stream stream = File.Create(filename))
            //    {
            //        image.Save(stream);
            //    }
            //}
        }
    }
}
