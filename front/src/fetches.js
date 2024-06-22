export async function fetchObjects() {
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

export async function fetchElements(objectID) {
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

export async function fetchElement(objectID, elementID, elementType) {
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
