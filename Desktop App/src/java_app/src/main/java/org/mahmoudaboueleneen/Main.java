package org.mahmoudaboueleneen;

import java.io.IOException;

public class Main {

    public static void main(String[] args) throws IOException {
        System.out.println("Claspath:" + System.getProperty("java.class.path"));
        System.out.println("At main: " + args[0] + " " + args[1]);
        ImageEditor.generateFont(args[0], args[1]);
    }
}