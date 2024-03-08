package org.techzoo.servlet3;


import java.awt.image.BufferedImage;

import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

import config.WebAppDirectoryConfig;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class ImageEditor
 */
@WebServlet("/ImageEditor")
public class ImageEditor extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ImageEditor() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String s = request.getParameter("Data");
		String name = request.getParameter("FileName");
		String ID = (String) request.getSession().getAttribute("userID");
		int[][] CharData = {{}};
		char [] Characters = {};
		int [] Width = {};
		int [] Height = {};

		String uploadDirectory = getServletContext().getRealPath("/") + WebAppDirectoryConfig.UPLOADS_DIRECTORY_NAME;
		File uploadDir = new File(uploadDirectory);
		if (!uploadDir.exists()) {
			uploadDir.mkdir();
		}
	
		if(s != "")
		{
			String [] Coordinates = s.split("/");
			File f = new File(uploadDirectory + File.separator + name);
		        BufferedImage image = ImageIO.read(f);
		        CharData = new int[Coordinates.length][];
		        Width = new int[Coordinates.length];
		        Height = new int[Coordinates.length];
		        Characters = new char[Coordinates.length];
		        int[] imagePixels = {};
		        int[] RGBholder = {}; 
		        int counter=0;
		        for(int i = 0 ; i < Coordinates.length ; i++)
					{
						String [] SubCoordinates = Coordinates[i].split(",");
						Characters[i] = SubCoordinates[0].charAt(0);
						int x1 = Integer.parseInt(SubCoordinates[1]);
						int y1 = Integer.parseInt(SubCoordinates[2]);
						int w = Integer.parseInt(SubCoordinates[3]);
						int h = Integer.parseInt(SubCoordinates[4]);
						System.out.println(image.getColorModel().getPixelSize());
						imagePixels = new int [w*h];
						if(image.getColorModel().getPixelSize() == 32)
				        {
				        	RGBholder = new int [w*h*4];
				        	image.getRaster().getPixels(x1, y1, w, h, RGBholder);
				        	for(int j = 0 ; j < RGBholder.length ; j+=4)
				        	{
				        		imagePixels[counter] = RGBholder[j];
				        		counter++;
				        	}
				        	counter=0;
				        	
				        }else if(image.getColorModel().getPixelSize() == 24)
				        {
				        	RGBholder = new int [w*h*3];
				        	image.getRaster().getPixels(x1, y1, w, h, RGBholder);
				        	for(int j = 0 ; j < RGBholder.length ; j+=3)
				        	{
				        		imagePixels[counter] = RGBholder[j];
				        		counter++;
				        	}
				        	counter=0;
				        	
				        }else{
					        image.getRaster().getPixels(x1, y1, w, h, imagePixels);
				        }
				    /*	for(int x = 0 ; x < imagePixels.length; x++)
				    	{
					    	System.out.println(imagePixels[x]+ " , ");

				    	}*/
				    	Width[i] = w;
				    	Height[i] = h;
				    	CharData[i] = imagePixels;

					}
		        FontCreation a = new FontCreation(CharData,Characters,Width,Height,ID,getServletContext());
				a.makeFont();
		}
	
	}

}
