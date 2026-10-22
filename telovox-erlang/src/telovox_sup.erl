%% ============================================================================
%% Project: Telovox - Open Source AI Telephony & Calling Automation Platform
%% Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
%% Copyright: (c) 2026 Fingvo. All rights reserved.
%% License: MIT License
%% ============================================================================
%% Description: Top-level OTP Supervisor ensuring zero-downtime telecom resilience.
%% ============================================================================

-module(telovox_sup).
-behaviour(supervisor).

-export([start_link/0]).
-export([init/1]).

-define(SERVER, ?MODULE).

start_link() ->
    supervisor:start_link({local, ?SERVER}, ?MODULE, []).

%% init/1 sets up the one_for_one supervision strategy
%% If any individual telephony worker crashes, the supervisor restarts only that worker.
init([]) ->
    SupFlags = #{
        strategy => one_for_one,
        intensity => 10,
        period => 5
    },
    ChildSpecs = [
        #{
            id => telovox_sip_gateway,
            start => {telovox_sip_gateway, start_link, []},
            restart => permanent,
            shutdown => 5000,
            type => worker,
            modules => [telovox_sip_gateway]
        },
        #{
            id => telovox_rtp_streamer,
            start => {telovox_rtp_streamer, start_link, []},
            restart => permanent,
            shutdown => 5000,
            type => worker,
            modules => [telovox_rtp_streamer]
        }
    ],
    {ok, {SupFlags, ChildSpecs}}.
