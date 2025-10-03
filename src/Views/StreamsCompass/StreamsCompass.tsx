/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { useMemo } from "react";
import GlowOrb from "./GlowOrb";
import useGetStreamData from "../../hooks/useGetStreamData";
import calculateRelativePosition from "../../utils/calculateRelativePosition";
import calculateCompassPosition from "../../utils/calculateCompassPosition";

function StreamsCompass() {
  const { streamData } = useGetStreamData();
  const currentPlayer = streamData.find((player) => player.currentPlayer);

  // Read headers directly from window
  const arrowPositions = useMemo(() => {
    if (!currentPlayer) return [];

    return streamData
      .filter((player) => player.id !== currentPlayer.id)
      .map((player) => {
        const position = calculateRelativePosition(currentPlayer, player);
        const compassPosition = calculateCompassPosition(
          position.bearing,
          window.innerWidth,
          window.innerHeight
        );

        return {
          player,
          bearing: position.bearing,
          x: compassPosition.x,
          y: compassPosition.y,
        };
      });
  }, [currentPlayer, streamData]);

  if (!currentPlayer) {
    return (
      <div className="w-full h-full bg-transparent flex flex-col items-center justify-center">
        <div className="text-xl">No current player found</div>
        <div>
          stream id header sent: {((window as any).REQUEST_HEADERS || {})["x-stream-id"]}
        </div>
        <div>
          {JSON.stringify(streamData, null, 2)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-transparent relative mb-4">
      {arrowPositions.map((arrow) => (
        <div
          key={arrow.player.id}
          className="absolute transition-all duration-300 ease-out"
          style={{
            left: `${arrow.x}px`,
            top: `${arrow.y}px`,
          }}
        >
          <GlowOrb color={arrow.player.color} />
        </div>
      ))}
    </div>
  );
}

export default StreamsCompass;
