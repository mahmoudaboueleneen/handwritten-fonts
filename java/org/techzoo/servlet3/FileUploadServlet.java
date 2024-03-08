package org.techzoo.servlet3;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

import config.WebAppDirectoryConfig;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.Part;

import org.apache.catalina.Session;

@WebServlet ("/upload")
@MultipartConfig
public class FileUploadServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response) 
		throws ServletException, IOException {
		uploadFile(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) 
		throws ServletException, IOException {
		uploadFile(request, response);
	}

	/**
	 * uploadFile method used to upload file to server.
	 *
	 ***/
	private void uploadFile(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException
	{
		String uploadDirectory = getServletContext().getRealPath("/") + WebAppDirectoryConfig.UPLOADS_DIRECTORY_NAME;
		File uploadDir = new File(uploadDirectory);
		if (!uploadDir.exists()) {
			uploadDir.mkdir();
		}

		for (Part part : request.getParts()) {
			String name = part.getName();
			InputStream is = request.getPart(name).getInputStream();
			String fileName = getUploadedFileName(part);
			FileOutputStream fos = new FileOutputStream(uploadDirectory + File.separator + fileName);
			int data = 0;
			while((data = is.read()) != -1) {
				fos.write(data);
			}
			fos.flush();
			fos.close();
			is.close();
			File f = new File(uploadDirectory + File.separator + fileName);
			System.out.println(f);
			request.setAttribute("FileName", fileName);
		    RequestDispatcher rd = getServletContext()
		                               .getRequestDispatcher("/success.jsp");
		    rd.forward(request, response);
		}

	}
	
	/**
	 * Method used to get uploaded file name.
	 * This will parse following string and get filename 
	 * Content-Disposition: form-data; name="content"; filename="a.txt"
	 **/
	private String getUploadedFileName(Part p) {
		String file = "", header = "Content-Disposition";
		String[] strArray = p.getHeader(header).split(";");
		for(String split : strArray) {
			if(split.trim().startsWith("filename")) {
				file = split.substring(split.indexOf('=') + 1);
				file = file.trim().replace("\"", "");
				System.out.println("File name : "+file);
			}
		}
		return file;
	}
	
}
