package org.mahmoudaboueleneen;

import java.io.IOException;

public class Main {

    public static void main(String[] args) throws IOException {
        // System.out.println("Printing args hehe2");
        // for (int i = 0; i < args.length; i++) {
        // System.out.println("Argument " + i + ": " + args[i]);
        // }

        ImageEditor.generateFont(args[0], args[1], args[2]);
    }

}