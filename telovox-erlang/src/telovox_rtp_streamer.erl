%% ============================================================================
%% Project: Telovox - Open Source AI Telephony & Calling Automation Platform
%% Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
%% Copyright: (c) 2026 Fingvo. All rights reserved.
%% License: MIT License
%% ============================================================================
%% Description: Real-time Transport Protocol (RTP) packet streamer & media router.
%% ============================================================================

-module(telovox_rtp_streamer).
-behaviour(gen_server).

%% API
-export([start_link/0, stream_audio_chunk/2, stop_stream/1]).

%% gen_server callbacks
-export([init/1, handle_call/3, handle_cast/2, handle_info/2, terminate/2, code_change/3]).

-record(state, {
    active_streams = #{}, %% Map of CallId => Socket/Channel
    rtp_base_port = 10000
}).

start_link() ->
    gen_server:start_link({local, ?MODULE}, ?MODULE, [], []).

%% Streams a raw binary audio chunk (e.g. 20ms G.711 / PCM / Opus) to Node.js speech orchestrator
stream_audio_chunk(CallId, AudioBinary) when is_binary(AudioBinary) ->
    gen_server:cast(?MODULE, {audio_chunk, CallId, AudioBinary}).

%% Closes active RTP stream on call completion
stop_stream(CallId) ->
    gen_server:cast(?MODULE, {stop_stream, CallId}).

%% gen_server callbacks
init([]) ->
    io:format("[Telovox RTP] Initializing RTP Media Router on port range 10000-20000...~n"),
    {ok, #state{}}.

handle_call(_Request, _From, State) ->
    {reply, ok, State}.

handle_cast({audio_chunk, CallId, AudioBinary}, State = #state{active_streams = Streams}) ->
    ByteSize = byte_size(AudioBinary),
    %% In production, packet is forwarded over Unix socket/IPC or TCP stream to Node.js
    %% io:format("[Telovox RTP] Forwarded ~p bytes for Call ~s~n", [ByteSize, CallId]),
    {noreply, State};

handle_cast({stop_stream, CallId}, State = #state{active_streams = Streams}) ->
    UpdatedStreams = maps:remove(CallId, Streams),
    io:format("[Telovox RTP] Closed RTP stream for Call: ~s~n", [CallId]),
    {noreply, State#state{active_streams = UpdatedStreams}};

handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info(_Info, State) ->
    {noreply, State}.

terminate(_Reason, _State) ->
    io:format("[Telovox RTP] RTP Media Router shutting down.~n"),
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}.
