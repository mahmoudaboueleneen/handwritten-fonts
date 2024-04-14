package org.mahmoudaboueleneen;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * @author Mahmoud Abou Eleneen
 */
public class Config {
    public static final String FONTS_DIRECTORY_NAME = "MyHandwrittenFonts";

    public static Path getFontsDirectoryPath() {
        return Paths.get(getUserHomeDir(), FONTS_DIRECTORY_NAME);
    }

    private static String getUserHomeDir() {
        return System.getProperty("user.home");
    }

}
