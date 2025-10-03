import { useState } from "react";
import Map from "../Views/Map/Map";
import StreamsCompass from "../Views/StreamsCompass/StreamsCompass";
import { CompassIcon, MapIcon } from "lucide-react";
import clsx from "clsx";

function WidgetPage() {
  const [view, setView] = useState<"map" | "streams-compass">("streams-compass");

  const handleMapStream = () => {
    setView("map");
  };

  const handleStreamsCompass = () => {
    setView("streams-compass");
  };

  return (
    <div className="w-full h-full bg-transparent overflow-hidden">
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
        <button
          className="backdrop-blur-md bg-gray-800/20 text-white px-6 py-3 rounded-xl shadow-lg"
          onClick={handleMapStream}
        >
          <MapIcon className={clsx("w-5 h-5", {
            "text-blue-400": view === "map",
            "text-gray-200": view !== "map"
          })} />
        </button>
        <button
          className="backdrop-blur-md bg-gray-800/20 text-white px-6 py-3 rounded-xl shadow-lg"
          onClick={handleStreamsCompass}
        >
          <CompassIcon className={clsx("w-5 h-5", {
            "text-purple-400": view === "streams-compass",
            "text-gray-200": view !== "streams-compass"
          })} />
        </button>
      </div>

      {view === "map" ? <Map /> : <StreamsCompass />}
    </div>
  );
}

export default WidgetPage;
