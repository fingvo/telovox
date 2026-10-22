%% ============================================================================
%% Project: Telovox - Open Source AI Telephony & Calling Automation Platform
%% Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
%% Copyright: (c) 2026 Fingvo. All rights reserved.
%% License: MIT License
%% ============================================================================
%% Description: SIP Gateway & Call Session Router for inbound/outbound telecommunication.
%% ============================================================================

-module(telovox_sip_gateway).
-behaviour(gen_server).

%% API
-export([start_link/0, handle_invite/3, terminate_call/1, get_active_calls/0]).

%% gen_server callbacks
-export([init/1, handle_call/3, handle_cast/2, handle_info/2, terminate/2, code_change/3]).

-record(state, {
    active_calls = #{},  %% Map of CallId => SessionDetails
    sip_port = 5060
}).

start_link() ->
    gen_server:start_link({local, ?MODULE}, ?MODULE, [], []).

%% Public API to simulate/handle SIP INVITE packet from Telnyx/Twilio/SIP Trunk
handle_invite(CallId, CallerNumber, RecipientNumber) ->
    gen_server:call(?MODULE, {invite, CallId, CallerNumber, RecipientNumber}).

%% Terminate call session upon receiving SIP BYE
terminate_call(CallId) ->
    gen_server:cast(?MODULE, {bye, CallId}).

%% Fetch count of current in-flight concurrent calls
get_active_calls() ->
    gen_server:call(?MODULE, get_active_calls).

%% gen_server callbacks
init([]) ->
    io:format("[Telovox SIP] Initializing SIP Gateway on port 5060...~n"),
    {ok, #state{}}.

handle_call({invite, CallId, CallerNumber, RecipientNumber}, _From, State = #state{active_calls = Calls}) ->
    Session = #{
        call_id => CallId,
        caller => CallerNumber,
        recipient => RecipientNumber,
        status => in_progress,
        started_at => erlang:system_time(millisecond)
    },
    UpdatedCalls = maps:put(CallId, Session, Calls),
    io:format("[Telovox SIP] Call established: ~s (~s -> ~s)~n", [CallId, CallerNumber, RecipientNumber]),
    {reply, {ok, Session}, State#state{active_calls = UpdatedCalls}};

handle_call(get_active_calls, _From, State = #state{active_calls = Calls}) ->
    {reply, maps:values(Calls), State};

handle_call(_Request, _From, State) ->
    {reply, ok, State}.

handle_cast({bye, CallId}, State = #state{active_calls = Calls}) ->
    case maps:is_key(CallId, Calls) of
        true ->
            io:format("[Telovox SIP] Call terminated: ~s~n", [CallId]),
            UpdatedCalls = maps:remove(CallId, Calls),
            {noreply, State#state{active_calls = UpdatedCalls}};
        false ->
            {noreply, State}
    end;

handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info(_Info, State) ->
    {noreply, State}.

terminate(_Reason, _State) ->
    io:format("[Telovox SIP] SIP Gateway shutting down.~n"),
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}.
