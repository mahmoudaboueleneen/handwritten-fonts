# import fontforge

# # Open the two fonts
# font1 = fontforge.open("Begok.ttf")
# font2 = fontforge.open("QuirkyRobot.ttf")

# # Interpolate the fonts
# font1.interpolateFonts(0.5, "QuirkyRobot.ttf")

# # Save the new font
# font1.generate("blended_font.ttf")

import fontforge
from mutatorMath.ufo import buildMutator


# Open the TTF font
font1 = fontforge.open("Begok.ttf")
font2 = fontforge.open("QuirkyRobot.ttf")

# Save the font in UFO format
font1.generate("Begok.ufo")
font2.generate("QuirkyRobot.ufo")


# Define the paths to your UFO fonts
path1 = "Begok.ufo"
path2 = "QuirkyRobot.ufo"

# Create a dictionary with your fonts and their locations in the design space
sources = {
    "font1": {"location": {"Weight": 0.0}, "path": path1},
    "font2": {"location": {"Weight": 1.0}, "path": path2},
}

# Build the mutator
mutator = buildMutator(sources)

# Interpolate the fonts
factor = 0.5  # Adjust this value to control the interpolation
instance = mutator.makeInstance({"Weight": factor})

# Save the interpolated font
instance.save("interpolated_font.ufo")
