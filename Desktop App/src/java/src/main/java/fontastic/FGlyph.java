package fontastic;

import processing.core.PVector;

import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;

/**
 * Fontastic
 * A font file writer for Processing.
 * http://code.andreaskoller.com/libraries/fontastic
 *
 * Copyright (C) 2013 Andreas Koller http://andreaskoller.com
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General
 * Public License along with this library; if not, write to the
 * Free Software Foundation, Inc., 59 Temple Place, Suite 330,
 * Boston, MA  02111-1307  USA
 * 
 * @author      Andreas Koller http://andreaskoller.com
 * @modified    02/27/2013
 * @version     0.3 (3)
 */

/**
 * Class FGlyph
 * 
 * Stores a glyph with all its properties.
 * 
 */
public class FGlyph {

	private char glyphChar;
	private List<FContour> contours;
	private int advanceWidth = 128;
	/**
	 * @author Mahmoud Abou Eleneen
	 * @note These two variable are NOT originally part of the FGlyph class. They
	 *       are used to store the descender characters and the descender height
	 *       value.
	 */
	private static final List<Character> DESCENDERS = Arrays.asList('g', 'j', 'p', 'q', 'y');
	private static final float descenderHeight = 150;

	FGlyph(char c) {
		glyphChar = c;
		this.contours = new ArrayList<FContour>();
	}

	public void addContour() {
		contours.add(new FContour());
	}

	public void addContour(PVector[] points) {
		contours.add(new FContour(points));
	}

	public void addContour(FPoint[] points) {
		contours.add(new FContour(points));
	}

	public void addContour(PVector[] points, PVector[] controlPoints1, PVector[] controlPoints2) {
		contours.add(new FContour(points, controlPoints1, controlPoints2));
	}

	public void addContour(FContour contour) {
		contours.add(contour);
	}

	public void setAdvanceWidth(int advanceWidth) {
		this.advanceWidth = advanceWidth;
	}

	public char getGlyphChar() {
		return glyphChar;
	}

	public int getAdvanceWidth() {
		return advanceWidth;
	}

	/**
	 * @author Mahmoud Abou Eleneen
	 * @note This method is NOT originally part of the FGlyph class. It has been
	 *       added to calculate the actual advance width of the glyph.It was added
	 *       due to problems with using the same advance width for all glyphs, as it
	 *       created a lot of space between them.
	 */
	public int getActualAdvanceWidth() {
		float minX = Float.MAX_VALUE;
		float maxX = Float.MIN_VALUE;

		for (FContour contour : contours) {
			for (FPoint point : contour.points) {
				if (point.x < minX) {
					minX = point.x;
				}
				if (point.x > maxX) {
					maxX = point.x;
				}
			}
		}

		return (int) (maxX - minX);
	}

	/**
	 * @author Mahmoud Abou Eleneen
	 * @note This method is NOT originally part of the FGlyph class. It has been
	 *       added to align the glyph to the baseline, so that all the glyphs start
	 *       from the same vertical level, except for descenders which are lowered
	 *       by a certain arbitrary descenderHeight value.
	 */
	public void alignToBaseline() {
		float minY = Float.MAX_VALUE;

		for (FContour contour : contours) {
			for (FPoint point : contour.points) {
				if (point.y < minY) {
					minY = point.y;
				}
			}
		}

		for (FContour contour : contours) {
			for (FPoint point : contour.points) {
				point.y -= minY;
			}
		}

		if (DESCENDERS.contains(glyphChar)) {
			for (FContour contour : contours) {
				for (FPoint point : contour.points) {
					point.y -= descenderHeight;
				}
			}
		}
	}

	public List<FContour> getContours() {
		return contours;
	}

	public FContour[] getContoursArray() {
		FContour[] contoursArray = contours.toArray(new FContour[contours.size()]);
		return contoursArray;
	}

	public FContour getContour(int index) {
		return contours.get(index);
	}

	public int getContourCount() {
		return contours.size();
	}

	public void setContour(int index, PVector[] points) {
		contours.set(index, new FContour(points));
	}

	public void setContour(int index, FPoint[] points) {
		contours.set(index, new FContour(points));
	}

	public void setContour(int index, FContour contour) {
		contours.set(index, contour);
	}

	public void clearContours() {
		this.contours.clear();
	}

}