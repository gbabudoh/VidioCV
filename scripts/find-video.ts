import axios from "axios";

interface PeerTubeVideo {
  uuid: string;
  name: string;
  createdAt: string;
}

async function main() {
  const VIDIOCV_URL = process.env.PEERTUBE_URL || "https://peertube.feendesk.com";
  try {
    const response = await axios.get(`${VIDIOCV_URL}/api/v1/videos?count=5&sort=-createdAt`);
    console.log("--- Latest 5 Videos on PeerTube ---");
    response.data.data.forEach((v: PeerTubeVideo) => {
      console.log(`UUID: ${v.uuid}, Name: ${v.name}, Created: ${v.createdAt}`);
    });
    console.log("--- End of List ---");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to fetch videos:", error.message);
    } else {
      console.error("An unexpected error occurred:", error);
    }
  }
}

main();
