import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import axiosInstance from "../api/axiosInstance";

export default function VideoPlayer({ movieId }) {
  const videoRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamInfo, setStreamInfo] = useState(null);

  const hlsRef = useRef(null);

  const setStatus = (message, type) => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const loadMovie = async () => {
    setIsLoading(true);
    setStatus("⏳ Fetching stream from Streaming Service...", "loading");

    try {
      // 1. FIXED: Route through API Gateway via Axios (automatically attaches JWT)
      const response = await axiosInstance.get(`/stream/${movieId}`);
      const data = response.data;

      setStatus(`✅ Stream loaded! Playing in ${data.quality}`, "success");
      setStreamInfo(data);
      playHLS(data.streamingURL, movieId);
    } catch (error) {
      // Safely extract Axios error messages
      const errorMsg = error.response?.data?.message || error.message || "Failed to load stream";
      setStatus(`❌ ${errorMsg}`, "error");
      setStreamInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const playHLS = (streamingURL, currentMovieId) => {
    const video = videoRef.current;

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: function (xhr, url) {
          if (url.includes(".m3u8") && !url.includes("X-Amz")) {
            const encodedPath = encodeURIComponent(
              url.split(".amazonaws.com/")[1]
            );

            // 2. FIXED: Point HLS.js to the API Gateway (Port 8080)
            xhr.open(
              "GET",
              `http://localhost:8080/api/v1/stream/${currentMovieId}/playlist?path=${encodedPath}`
            );

            // 3. FIXED: Manually inject the JWT token so the Gateway doesn't block HLS.js
            const token = localStorage.getItem('token');
            if (token) {
              xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }
          }
        },
      });

      hlsRef.current = hls;

      hls.loadSource(streamingURL);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamingURL;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
    }
  };

  useEffect(() => {
    if (movieId) {
      loadMovie();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [movieId]);

  const getStatusColor = () => {
    if (statusType === "loading") return "text-white";
    if (statusType === "success") return "text-green-500";
    if (statusType === "error") return "text-red-500";
    return "text-white";
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-6">
      <div className={`text-sm font-medium h-5 ${getStatusColor()}`}>
        {statusMessage}
      </div>

      <div className="w-full bg-black rounded-lg overflow-hidden border-2 border-gray-800 shadow-2xl relative pb-[56.25%]">
        <video
          ref={videoRef}
          id="video"
          controls
          className="absolute top-0 left-0 w-full h-full bg-black"
        ></video>
      </div>

      {streamInfo && (
        <div className="w-full mt-6 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-red-600 font-bold mb-4 text-lg">
            📊 Stream Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-md">
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Movie ID
              </div>
              <div className="text-white text-sm break-all">
                {streamInfo.movieId}
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-md">
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Available Qualities
              </div>
              <div className="text-white text-sm break-all">
                {streamInfo.quality}
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-md">
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                URL Expires In
              </div>
              <div className="text-white text-sm break-all">
                {streamInfo.expiresInMinutes} minutes
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-md">
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Streaming URL
              </div>
              <div className="text-white text-sm break-all">
                {streamInfo.streamingURL?.substring(0, 60)}...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}