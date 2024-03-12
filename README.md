# Handwritten Fonts

## Table of Contents

## Overview

## Desktop App

1. Add dependencies to the local Maven Repository. These dependencies aren't present on the Maven Central Repository so they were downloaded manually, added to the lib folder of the project, then they must be added to the local Maven Repository.

   ```bash
   mvn install:install-file -Dfile='lib/doubletype.jar' -DgroupId='com.example' -DartifactId='doubletype' -Dversion='1.0' -Dpackaging=jar
   ```

   ```bash
   mvn install:install-file -Dfile='lib/geomerative.jar' -DgroupId='com.example' -DartifactId='geomerative' -Dversion='1.0' -Dpackaging=jar
   ```

   ```bash
   mvn install:install-file -Dfile='lib/sfntly.jar' -DgroupId='com.example' -DartifactId='sfntly' -Dversion='1.0' -Dpackaging=jar
   ```

   ```bash
   mvn install:install-file -Dfile='lib/sfnttool.jar' -DgroupId='com.example' -DartifactId='sfnttool' -Dversion='1.0' -Dpackaging=jar
   ```

   ```bash
   mvn install:install-file -Dfile='lib/catalina.jar' -DgroupId='org.apache.tomcat' -DartifactId='tomcat-catalina' -Dversion='1.0' -Dpackaging=jar
   ```

1. Build the Java App into one JAR file including all dependencies

   ```bash
   mvn clean install
   ```

1. Start the Electron App

   ```bash
   npm start
   ```

## Browser Extension

## IPFS

## Ethereum

## Getting Started
