export const getTextColor = (background_color) => {
	// Remove the "#" symbol if present
	if (background_color.startsWith("#")) {
	  background_color = background_color.slice(1);
	}
  
	// Convert the background color to RGB values
	const r = parseInt(background_color.slice(0, 2), 16);
	const g = parseInt(background_color.slice(2, 4), 16);
	const b = parseInt(background_color.slice(4, 6), 16);
  
	// Calculate the relative luminance using the formula for sRGB
	const relative_luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  
	// Determine the appropriate text color based on the relative luminance
	let text_color;
	if (relative_luminance > 0.5) {
	  text_color = "#000000";  // Black for light backgrounds
	} else {
	  text_color = "#FFFFFF";  // White for dark backgrounds
	}
  
	return text_color;
}