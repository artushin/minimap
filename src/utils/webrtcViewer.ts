/* eslint-disable @typescript-eslint/no-explicit-any */
import * as mediasoupClient from "mediasoup-client";
import { v4 as uuidv4 } from "uuid";

const defaultOrtcRouterRtpCapabilities = {
  codecs: [
    {
      clockRate: 90000,
      kind: "video",
      mimeType: "video/H264",
      parameters: {
        "level-asymmetry-allowed": 1,
        "packetization-mode": 1,
        "profile-level-id": "42e01f",
        "x-google-start-bitrate": 1000,
      },
      preferredPayloadType: 100,
      rtcpFeedback: [
        { type: "nack" },
        { type: "nack", parameter: "pli" },
        { type: "ccm", parameter: "fir" },
        { type: "goog-remb" },
        { type: "transport-cc" },
      ],
    },
    {
      clockRate: 90000,
      kind: "video",
      mimeType: "video/rtx",
      parameters: {
        apt: 100,
      },
      preferredPayloadType: 101,
      rtcpFeedback: [],
    },
    {
      clockRate: 90000,
      kind: "video",
      mimeType: "video/H264",
      parameters: {
        "level-asymmetry-allowed": 1,
        "packetization-mode": 1,
        "profile-level-id": "420020",
      },
      preferredPayloadType: 102,
      rtcpFeedback: [
        { type: "nack" },
        { type: "nack", parameter: "pli" },
        { type: "ccm", parameter: "fir" },
        { type: "goog-remb" },
        { type: "transport-cc" },
      ],
    },
    {
      clockRate: 90000,
      kind: "video",
      mimeType: "video/rtx",
      parameters: {
        apt: 102,
      },
      preferredPayloadType: 103,
      rtcpFeedback: [],
    },
    {
      clockRate: 90000,
      kind: "video",
      mimeType: "video/H264",
      parameters: {
        "level-asymmetry-allowed": 1,
        "packetization-mode": 1,
        "profile-level-id": "4d0032",
      },
      preferredPayloadType: 104,
      rtcpFeedback: [
        { type: "nack" },
        { type: "nack", parameter: "pli" },
        { type: "ccm", parameter: "fir" },
        { type: "goog-remb" },
        { type: "transport-cc" },
      ],
    },
    {
      clockRate: 90000,
      kind: "video",
      mimeType: "video/rtx",
      parameters: {
        apt: 104,
      },
      preferredPayloadType: 105,
      rtcpFeedback: [],
    },
    {
      clockRate: 90000,
      kind: "video",
      mimeType: "video/H264",
      parameters: {
        "level-asymmetry-allowed": 1,
        "packetization-mode": 1,
        "profile-level-id": "64002A",
      },
      preferredPayloadType: 106,
      rtcpFeedback: [
        { type: "nack" },
        { type: "nack", parameter: "pli" },
        { type: "ccm", parameter: "fir" },
        { type: "goog-remb" },
        { type: "transport-cc" },
      ],
    },
    {
      clockRate: 90000,
      kind: "video",
      mimeType: "video/rtx",
      parameters: {
        apt: 106,
      },
      preferredPayloadType: 107,
      rtcpFeedback: [],
    },
    {
      clockRate: 90000,
      kind: "video",
      mimeType: "video/VP8",
      parameters: {},
      preferredPayloadType: 108,
      rtcpFeedback: [
        { type: "nack" },
        { type: "nack", parameter: "pli" },
        { type: "ccm", parameter: "fir" },
        { type: "goog-remb" },
        { type: "transport-cc" },
      ],
    },
    {
      clockRate: 90000,
      kind: "video",
      mimeType: "video/rtx",
      parameters: {
        apt: 108,
      },
      preferredPayloadType: 109,
      rtcpFeedback: [],
    },
    {
      channels: 2,
      clockRate: 48000,
      kind: "audio",
      mimeType: "audio/opus",
      parameters: {
        usedtx: 0,
        useinbandfec: 1,
      },
      preferredPayloadType: 111,
      rtcpFeedback: [{ type: "transport-cc" }],
    },
  ],
  headerExtensions: [
    {
      kind: "audio",
      uri: "urn:ietf:params:rtp-hdrext:sdes:mid",
      preferredId: 1,
      preferredEncrypt: false,
      direction: "sendrecv",
    },
    {
      kind: "video",
      uri: "urn:ietf:params:rtp-hdrext:sdes:mid",
      preferredId: 1,
      preferredEncrypt: false,
      direction: "sendrecv",
    },
    {
      kind: "video",
      uri: "urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id",
      preferredId: 2,
      preferredEncrypt: false,
      direction: "recvonly",
    },
    {
      kind: "video",
      uri: "urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id",
      preferredId: 3,
      preferredEncrypt: false,
      direction: "recvonly",
    },
    {
      kind: "audio",
      uri: "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time",
      preferredId: 4,
      preferredEncrypt: false,
      direction: "sendrecv",
    },
    {
      kind: "video",
      uri: "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time",
      preferredId: 4,
      preferredEncrypt: false,
      direction: "sendrecv",
    },
    {
      kind: "audio",
      uri: "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01",
      preferredId: 5,
      preferredEncrypt: false,
      direction: "recvonly",
    },
    {
      kind: "video",
      uri: "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01",
      preferredId: 5,
      preferredEncrypt: false,
      direction: "sendrecv",
    },
    {
      kind: "video",
      uri: "http://tools.ietf.org/html/draft-ietf-avtext-framemarking-07",
      preferredId: 6,
      preferredEncrypt: false,
      direction: "sendrecv",
    },
    {
      kind: "video",
      uri: "urn:ietf:params:rtp-hdrext:framemarking",
      preferredId: 7,
      preferredEncrypt: false,
      direction: "sendrecv",
    },
    {
      kind: "audio",
      uri: "urn:ietf:params:rtp-hdrext:ssrc-audio-level",
      preferredId: 10,
      preferredEncrypt: false,
      direction: "sendrecv",
    },
    {
      kind: "video",
      uri: "urn:3gpp:video-orientation",
      preferredId: 11,
      preferredEncrypt: false,
      direction: "sendrecv",
    },
    {
      kind: "video",
      uri: "urn:ietf:params:rtp-hdrext:toffset",
      preferredId: 12,
      preferredEncrypt: false,
      direction: "sendrecv",
    },
    {
      kind: "audio",
      uri: "http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time",
      preferredId: 13,
      preferredEncrypt: false,
      direction: "sendrecv",
    },
    {
      kind: "video",
      uri: "http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time",
      preferredId: 13,
      preferredEncrypt: false,
      direction: "sendrecv",
    },
  ],
};

interface WebRTCState {
  device: mediasoupClient.types.Device;
  recvTransport: mediasoupClient.types.Transport;
  videoConsumer?: mediasoupClient.types.Consumer;
  audioConsumer?: mediasoupClient.types.Consumer;
  transportResp: any;
  routerRtpCapabilities: any;
  onCleanup: () => Promise<void>;
}

class WebRTCViewer {
  private webrtcState?: WebRTCState;

  private async get(url: string): Promise<any> {
    const response = await fetch(url);
    return response.json();
  }

  private async post(url: string, data: any): Promise<any> {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP ${response.status} error from ${url}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json();
  }

  async startWebRTCViewer(
    videoElement: HTMLVideoElement,
    streamKey: string,
    streams?: any[]
  ): Promise<void> {
    if (videoElement.srcObject) {
      throw new Error("Video element is already playing. Stop playback first.");
    }

    const urls = await this.discoverCallbackUrls();
    if (!urls) {
      throw new Error("Could not discover callback URLs");
    }

    const msctlUrl = urls.msCtrlCallBackUrl;
    const shmcliUrl = urls.ctrlCallbackUrl;

    // Use provided streams or fetch them if not provided
    let streamsData: any[];
    if (streams) {
      streamsData = streams;
    } else {
      const streamsList = await this.get(
        `${shmcliUrl}/api/v1/streams?playurls=true`
      );
      streamsData = streamsList.streams.map((element: any) => {
        const stream = streamsList.containers.find(
          (e: any) => e.fullName === element.fullName
        );
        const streamFullName = stream ? stream.fullName : "";
        return { ...element, streamFullName };
      });
    }

    // Find audio and video channels
    const audioChannel = streamsData.find(
      (s: any) =>
        s.mux === "rtp" && s.streamName === streamKey && s.codec === "opus"
    );
    const videoChannel = streamsData.find(
      (s: any) =>
        (s.mux === "rtp" && s.streamName === streamKey && s.codec === "vp8") ||
        (s.mux === "rtp" && s.streamName === streamKey && s.codec === "h264")
    );

    if (!videoChannel) {
      throw new Error(`Stream has neither video nor audio: ${streamKey}`);
    }

    const routerId =
      audioChannel?.namespace || videoChannel?.namespace || "default";
    const streamFullName = audioChannel?.fullName || videoChannel?.fullName;

    const routerRtpCapabilities = await this.post(
      `${msctlUrl}/api/v1/rtpcapabilities`,
      defaultOrtcRouterRtpCapabilities
    );

    const transportId = uuidv4();
    // const transportId = `c_${streamKey}_viewers`

    // Create transport
    const transportResp = await this.post(
      `${msctlUrl}/api/v1/create-webrtc-transport`,
      {
        envelope: {
          workerSet: "egress",
          handlerId: routerId,
        },
        data: {
          transportId,
        },
      }
    );

    // Create local device and transport
    const device = new mediasoupClient.Device();
    await device.load({ routerRtpCapabilities });

    // Get the device's actual RTP capabilities (negotiated between router and browser)
    const deviceRtpCapabilities = device.rtpCapabilities;

    const recvTransport = await device.createRecvTransport(
      transportResp.data.data
    );
    // return transportResp.data.data

    // Handle transport connect
    recvTransport.on(
      "connect",
      async (
        { dtlsParameters }: any,
        cb: () => void,
        error: (err?: any) => void
      ) => {
        try {
          const transportConnResp = await this.post(
            `${msctlUrl}/api/v1/transport-connect`,
            {
              envelope: {
                workerSet: transportResp.workerSet,
                workerPid: transportResp.workerPid,
                handlerId: transportResp.data.data.id,
              },
              data: { dtlsParameters },
            }
          );

          if (transportConnResp.error === "Error") {
            throw new Error(
              `Failed to connect transport: ${transportConnResp.reason}`
            );
          }
          cb();
        } catch (err) {
          error(err);
          throw err;
        }
      }
    );

    // Create consumers
    let videoConsumer: any | undefined;
    let audioConsumer: any | undefined;
    let videoRtpParameters: any;
    let audioRtpParameters: any;

    const videoConsumerId = uuidv4();
    const audioConsumerId = uuidv4();

    if (videoChannel) {
      console.log(
        "Attempting video consume with deviceRtpCapabilities:",
        deviceRtpCapabilities
      );

      const consumeResp = await this.post(`${msctlUrl}/api/v1/consume`, {
        envelope: {
          workerSet: transportResp.workerSet,
          workerPid: transportResp.workerPid,
          handlerId: transportResp.data.data.id,
        },
        data: {
          streamFullName,
          producerId: {
            transportId: streamKey,
            id: videoChannel.channelId,
          },
          consumerId: videoConsumerId,
          paused: true,
          mid: "1",
          kind: "video",
          type: "simple",
          rtpCapabilities: routerRtpCapabilities,
          deviceRtpCapabilities: routerRtpCapabilities,
        },
      });

      console.log("Video consume response:", consumeResp);

      if (consumeResp.error === "Error") {
        throw new Error(`Failed to consume video: ${consumeResp.reason}`);
      }

      if (!consumeResp?.data?.data) {
        throw new Error(
          `Invalid consume response: ${JSON.stringify(consumeResp)}`
        );
      }

      videoRtpParameters = consumeResp.data.data.rtpParameters;
      videoRtpParameters.mid = "1";

      videoConsumer = await recvTransport.consume({
        id: videoConsumerId,
        producerId: `${streamKey}$${videoChannel.channelId}`,
        kind: "video",
        rtpParameters: videoRtpParameters,
      });
    }

    if (audioChannel) {
      const consumeResp = await this.post(`${msctlUrl}/api/v1/consume`, {
        envelope: {
          workerSet: transportResp.workerSet,
          workerPid: transportResp.workerPid,
          handlerId: transportResp.data.data.id,
        },
        data: {
          streamFullName,
          producerId: {
            transportId: streamKey,
            id: audioChannel.channelId,
          },
          consumerId: audioConsumerId,
          paused: true,
          mid: "2",
          kind: "audio",
          type: "simple",
          rtpCapabilities: routerRtpCapabilities,
          deviceRtpCapabilities: routerRtpCapabilities,
        },
      });

      if (consumeResp.error === "Error") {
        throw new Error(`Failed to consume audio: ${consumeResp.reason}`);
      }

      audioRtpParameters = consumeResp.data.data.rtpParameters;
      audioRtpParameters.mid = "2";

      audioConsumer = await recvTransport.consume({
        id: audioConsumerId,
        producerId: `${streamKey}$${audioChannel.channelId}`,
        kind: "audio",
        rtpParameters: audioRtpParameters,
      });
    }

    // Create media stream
    const tracks = [];
    if (videoConsumer) tracks.push(videoConsumer.track);
    if (audioConsumer) tracks.push(audioConsumer.track);

    videoElement.srcObject = new MediaStream(tracks);

    // Resume consumers
    if (videoConsumer) {
      await this.post(`${msctlUrl}/api/v1/consumer-resume`, {
        envelope: {
          workerSet: transportResp.workerSet,
          workerPid: transportResp.workerPid,
          handlerId: videoConsumerId,
        },
      });
    }

    if (audioConsumer) {
      await this.post(`${msctlUrl}/api/v1/consumer-resume`, {
        envelope: {
          workerSet: transportResp.workerSet,
          workerPid: transportResp.workerPid,
          handlerId: audioConsumerId,
        },
      });
    }

    // Store state for cleanup
    this.webrtcState = {
      device,
      recvTransport,
      videoConsumer,
      audioConsumer,
      transportResp,
      routerRtpCapabilities,
      onCleanup: async () => {
        try {
          await this.post(`${msctlUrl}/api/v1/close-transport`, {
            envelope: {
              workerSet: transportResp.workerSet,
              workerPid: transportResp.workerPid,
              handlerId: routerId,
            },
            data: {
              transportId: transportResp.data.data.id,
            },
          });
        } catch (e) {
          console.error("Error closing transport:", e);
        }
      },
    };

    // Setup cleanup listener
    const onStreamClose = async () => {
      if (this.webrtcState?.onCleanup) {
        await this.webrtcState.onCleanup();
      }
      if (videoConsumer) videoConsumer.close();
      if (audioConsumer) audioConsumer.close();
      if (recvTransport) recvTransport.close();

      if (videoElement.srcObject) {
        (videoElement.srcObject as MediaStream).removeEventListener(
          "broadcastended",
          onStreamClose
        );
      }
    };

    (videoElement.srcObject as MediaStream).addEventListener(
      "broadcastended",
      onStreamClose
    );
  }

  async stopViewer(): Promise<void> {
    if (this.webrtcState) {
      await this.webrtcState.onCleanup();
      if (this.webrtcState.videoConsumer)
        this.webrtcState.videoConsumer.close();
      if (this.webrtcState.audioConsumer)
        this.webrtcState.audioConsumer.close();
      if (this.webrtcState.recvTransport)
        this.webrtcState.recvTransport.close();
      this.webrtcState = undefined;
    }
  }

  private async discoverCallbackUrls(): Promise<{
    msCtrlCallBackUrl: string;
    ctrlCallbackUrl: string;
  } | null> {
    // Get headers from window that were injected by our plugin
    const requestHeaders = (window as any).REQUEST_HEADERS || {};

    const msCtrlCallBackUrl =
      requestHeaders["x-ms-ctrl-callback-url"] ||
      "http://10.51.80.25:8084/foundation-transcode/msctl";
    const ctrlCallbackUrl =
      requestHeaders["x-ctrl-callback-url"] ||
      "http://10.51.80.25:8084/foundation-transcode/shmcli";

    if (!msCtrlCallBackUrl || !ctrlCallbackUrl) {
      console.error("Required callback URL headers not found:", {
        "x-ms-ctrl-callback-url": msCtrlCallBackUrl,
        "x-ctrl-callback-url": ctrlCallbackUrl,
      });
      return null;
    }

    return {
      msCtrlCallBackUrl,
      ctrlCallbackUrl,
    };
  }
}

export default WebRTCViewer;
