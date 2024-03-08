package config;

import jakarta.servlet.ServletContext;

import java.io.File;

/**
 * Config class holding needed paths for directories
 * on the web server (intended for Apache Tomcat's web application directory),
 * as well as util functions to ensure their existence throughout the code.
 *
 * @author Mahmoud Abou Eleneen
 */
public class WebAppDirectoryConfig {
    public static final String UPLOADS_DIRECTORY_NAME = "uploads";
    public static final String FONTS_DIRECTORY_NAME = "fonts";

//    /**
//     * Ensures that the 'uploads' directory exists within
//     * the web application directory in Apache Tomcat.
//     * If the directory does not exist, it is created.
//     *
//     * @param servletContext The ServletContext of the web application.
//     */
//    public static void ensureUploadsDirectoryExists(ServletContext servletContext) {
//        String uploadDirectoryPath = servletContext.getRealPath("/") + UPLOADS_DIRECTORY_NAME;
//        File uploadDir = new File(uploadDirectoryPath);
//        if (!uploadDir.exists()) {
//            uploadDir.mkdir();
//        }
//    }
//
//    /**
//     * Ensures that the 'fonts' directory exists within
//     * the web application directory in Apache Tomcat.
//     * If the directory does not exist, it is created.
//     *
//     * @param servletContext The ServletContext of the web application.
//     */
//    public static void ensureFontsDirectoryExists(ServletContext servletContext) {
//        String fontDirectoryPath = servletContext.getRealPath("/") + FONTS_DIRECTORY_NAME;
//        File fontDir = new File(fontDirectoryPath);
//        if (!fontDir.exists()) {
//            fontDir.mkdir();
//        }
//    }

}
