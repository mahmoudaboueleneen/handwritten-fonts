package org.mahmoudaboueleneen;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

public class ImageEditor {

	public static void generateFont(String data, String filePath) throws IOException {

		int[][] CharData = { {} };
		char[] Characters = {};
		int[] Width = {};
		int[] Height = {};

		if (data != "") {
			String[] Coordinates = data.split("/");
			File f = new File(filePath);
			BufferedImage image = ImageIO.read(f);
			CharData = new int[Coordinates.length][];
			Width = new int[Coordinates.length];
			Height = new int[Coordinates.length];
			Characters = new char[Coordinates.length];
			int[] imagePixels = {};
			int[] RGBholder = {};
			int counter = 0;

			for (int i = 0; i < Coordinates.length; i++) {
				String[] SubCoordinates = Coordinates[i].split(",");
				Characters[i] = SubCoordinates[0].charAt(0);
				int x1 = Integer.parseInt(SubCoordinates[1]);
				int y1 = Integer.parseInt(SubCoordinates[2]);
				int w = Integer.parseInt(SubCoordinates[3]);
				int h = Integer.parseInt(SubCoordinates[4]);
				System.out.println(image.getColorModel().getPixelSize());
				imagePixels = new int[w * h];

				if (image.getColorModel().getPixelSize() == 32) {
					RGBholder = new int[w * h * 4];
					image.getRaster().getPixels(x1, y1, w, h, RGBholder);

					for (int j = 0; j < RGBholder.length; j += 4) {
						imagePixels[counter] = RGBholder[j];
						counter++;
					}
					counter = 0;

				} else if (image.getColorModel().getPixelSize() == 24) {
					RGBholder = new int[w * h * 3];
					image.getRaster().getPixels(x1, y1, w, h, RGBholder);
					for (int j = 0; j < RGBholder.length; j += 3) {
						imagePixels[counter] = RGBholder[j];
						counter++;
					}
					counter = 0;

				} else {
					image.getRaster().getPixels(x1, y1, w, h, imagePixels);
				}

				Width[i] = w;
				Height[i] = h;
				CharData[i] = imagePixels;
			}

			FontCreation a = new FontCreation(CharData, Characters, Width, Height);
			a.makeFont();
		}
	}
}
