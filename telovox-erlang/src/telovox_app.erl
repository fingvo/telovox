%% ============================================================================
%% Project: Telovox - Open Source AI Telephony & Calling Automation Platform
%% Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
%% Copyright: (c) 2026 Fingvo. All rights reserved.
%% License: MIT License
%% ============================================================================
%% Description: Erlang Application behaviour entrypoint for Telovox Media Engine.
%% ============================================================================

-module(telovox_app).
-behaviour(application).

-export([start/2, stop/1]).

%% Application start callback. Initializes top-level supervision tree.
start(_StartType, _StartArgs) ->
    io:format("============================================================~n"),
    io:format("Telovox Erlang Media & Telephony Gateway starting...~n"),
    io:format("Author: Sohail MN (Aka Fingvo) - Full Stack Engineer~n"),
    io:format("Copyright (c) 2026 Fingvo. All rights reserved. (MIT License)~n"),
    io:format("============================================================~n"),
    telovox_sup:start_link().

%% Application stop callback. Gracefully tears down telephony sessions.
stop(_State) ->
    io:format("Telovox Erlang Media Gateway stopped gracefully.~n"),
    ok.
