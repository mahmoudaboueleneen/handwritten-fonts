package org.mahmoudaboueleneen;

import fontastic.*;
import processing.core.PApplet;
import processing.core.PVector;

import java.util.UUID;

public class FontCreation extends PApplet {
	int[][] Data;
	char[] Cs;
	int[] w;
	int[] h;

	public FontCreation(int[][] charData, char[] characters, int[] width, int[] height) {
		Data = charData;
		Cs = characters;
		w = width;
		h = height;
	}

	public void makeFont() {
		String userID = UUID.randomUUID().toString();

		System.out.println("Generated IDDDDDDDDDDDDddddddd :" + userID);

		Fontastic font = new Fontastic(this, userID);

		// TODO: Change author name
		// Set author name - will be saved in TTF file too
		font.setAuthor("Mahmoud Abou Eleneen");
		font.getEngine().setBaseline(0);
		font.getEngine().setMeanline(0.5);

		PVector[] points = {};
		if (Data.length != 0) {
			for (int i = 0; i < Data.length; i++) {
				font.addGlyph(Cs[i]);
				for (int j = 0; j < Data[i].length; j++) {
					if (Data[i][j] == 0 || Data[i][j] < 200) {
						points = new PVector[4];
						points[0] = new PVector((j % w[i] * 10) - 6, (-1 * (j / w[i] * 10) - 6) + 400);
						points[1] = new PVector((j % w[i] * 10) + 6, (-1 * (j / w[i] * 10) - 6) + 400);
						points[2] = new PVector((j % w[i] * 10) + 6, (-1 * (j / w[i] * 10) + 6) + 400);
						points[3] = new PVector((j % w[i] * 10) - 6, (-1 * (j / w[i] * 10) + 6) + 400);
						font.getGlyph(Cs[i]).addContour(points);
					}
				}
			}
		}

		font.buildFont();
		font.cleanup();
	}

}
