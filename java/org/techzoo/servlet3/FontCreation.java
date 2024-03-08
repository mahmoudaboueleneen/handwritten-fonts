package org.techzoo.servlet3;

import fontastic.*;
import geomerative.*;
import jakarta.servlet.ServletContext;
import processing.core.PApplet;
import processing.core.PFont;
import processing.core.PVector;

import java.util.UUID;

public class FontCreation extends PApplet{
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	int[][] Data;
	char[] Cs;
	String User;
	int [] w;
	String userID;
	int [] h;
	Fontastic f;
	ServletContext sc;

	public FontCreation(int[][] charData, char[] characters, int[] width, int[] height, String ID, ServletContext servletContext)
	{
		Data = charData;
		Cs = characters;
		w = width;
		h = height;
		userID = ID;
		sc = servletContext;
	}
	
	public void makeFont()
	{
		System.out.println("IDDDDDDDDDDDDddddddd :" + userID);

		if (userID == null) {
			userID = UUID.randomUUID().toString();
			System.out.println("Generated IDDDDDDDDDDDDddddddd :" + userID);
		}

		Fontastic font = new Fontastic(this, userID, sc);  // Create a new Fontastic object

    	font.setAuthor("Mina Samy");                  // Set author name - will be saved in TTF file too
    	font.getEngine().setBaseline(0);
    	font.getEngine().setMeanline(5);


    	PVector[] points = {};
    	if(Data.length != 0)
    	{
    		for(int i = 0 ; i < Data.length ; i++)
    		{
    			font.addGlyph(Cs[i]);
    			for(int j = 0 ; j < Data[i].length; j++)
    			{
    				if(Data[i][j] == 0 || Data[i][j] < 200 )
    				{
    	    			points = new PVector[4];
    					points[0] = new PVector((j%w[i]*10)-6, (-1*(j/w[i]*10)-6)+400); 
    					points[1] = new PVector((j%w[i]*10)+6, (-1*(j/w[i]*10)-6)+400); 
    					points[2] = new PVector((j%w[i]*10)+6, (-1*(j/w[i]*10)+6)+400); 
    					points[3] = new PVector((j%w[i]*10)-6, (-1*(j/w[i]*10)+6)+400); 
    					font.getGlyph(Cs[i]).addContour(points);
    				}
    			}
    		}
    	}

    	font.buildFont();                                 
    	font.cleanup();    
	}

}
