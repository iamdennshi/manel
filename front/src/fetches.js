import { objects, elements } from "./data";

export async function fetchObjects() {
  console.log("BACKEND_IP = " + process.env.BACKEND_IP);
  if (process.env.BACKEND_IP == undefined) {
    return objects;
  } else {
    try {
      const response = await fetch(`http://${process.env.BACKEND_IP}/objects/`);
      if (!response.ok) {
        throw new Error("Failed to fetch objects");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching objects:", error);
    }
  }
}

export async function fetchElements(objectID) {
  if (process.env.BACKEND_IP == undefined) {
    return elements[objectID];
  } else {
    try {
      const response = await fetch(
        `http://${process.env.BACKEND_IP}/objects/${objectID}/elements`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch elements");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching elements:", error);
    }
  }
}

export async function fetchElement(objectID, elementID, elementType) {
  if (process.env.BACKEND_IP == undefined) {
    return elements[objectID][`${elementType}s`][elementID];
  } else {
    try {
      const response = await fetch(
        `http://${process.env.BACKEND_IP}/objects/${objectID}/elements/${elementType}s/${elementID}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch the element");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching the element:", error);
    }
  }
}
