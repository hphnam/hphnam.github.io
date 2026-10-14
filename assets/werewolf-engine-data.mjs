// Verified implementation excerpts, pinned to the inspected repository commit.
export const sourceCommit="3ee1d2005f99a6849c1a76f5f35159a8df52248c";
export const graphNodes=[
  {
    "id": "eliminate",
    "name": "Wolf target",
    "group": "Night",
    "x": 12,
    "y": 15,
    "title": "The wolves coordinate a private target.",
    "copy": "The node gathers proposals from living wolves. Agreement, a single remaining wolf, or a tie-break determines the target before protection is resolved.",
    "mechanism": "Game state stores the proposed target; the target is not yet a casualty.",
    "snippet": {
      "file": "game.py",
      "start": 124,
      "end": 138,
      "code": "    def eliminate_node(self, state: GraphState, config: RunnableConfig) -> GraphState:\n        gs = state[\"game\"]\n        player_objects: dict[str, BasePlayer] = config.get(\"configurable\", {}).get(\"player_objects\", {})\n\n        # Logging suspicion\n        round_log = gs._suspicion_log.setdefault(gs._round_num, {})\n        for name in gs._alive_players:\n            round_log[name] = copy.deepcopy(player_objects[name]._suspicion)\n\n        tqdm.tqdm.write(f\"\\n\\n=== Round {gs._round_num} ===\")\n        tqdm.tqdm.write(\"*** Night ***\")\n        active_wolves = [w for w in gs._werewolves if w in gs._alive_players]\n        gs._eliminated = None  # Crucial: Reset for the logic of wolf agreement of target\n\n        if not active_wolves:  # If all the wolves are actually killed",
      "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/game.py#L124-L138"
    }
  },
  {
    "id": "protect",
    "name": "Guard protects",
    "group": "Night",
    "x": 37,
    "y": 15,
    "title": "A role-specific action changes the state.",
    "copy": "The Guard chooses protection through its own player object. The shared GameState stores that action for the moderator to resolve later.",
    "mechanism": "Role objects come through RunnableConfig; game state travels through GraphState.",
    "snippet": {
      "file": "game.py",
      "start": 205,
      "end": 222,
      "code": "    def protect_node(self, state: GraphState, config: RunnableConfig) -> GraphState:\n        \"\"\"Guard chooses a player to protect during the night.\"\"\"\n        gs = state[\"game\"]\n        player_objects = config.get(\"configurable\", {}).get(\"player_objects\", {})\n        guard_name = gs._guard\n        guard_obj: Guard = player_objects.get(guard_name)\n        gs._protected = None\n\n        # check if guard was killed\n        if guard_name not in gs._alive_players:\n            gs._phase = Phase.UNMASK\n            return {\"game\": gs}\n\n        protect_target, analysis, _ = guard_obj.protect(gs._alive_players, gs._round_num)\n\n        if not protect_target:\n            raise ValueError(f\"{guard_name} (Guard) failed to specify a protection target.\")\n",
      "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/game.py#L205-L222"
    }
  },
  {
    "id": "unmask",
    "name": "Seer investigates",
    "group": "Night",
    "x": 62,
    "y": 15,
    "title": "The model chooses. The moderator verifies.",
    "copy": "The Seer proposes an investigation target. Game logic checks the true alignment and records a confirmed wolf / not-wolf result in the Seer’s private memory.",
    "mechanism": "Verified facts are supplied by the game, rather than invented by the model.",
    "snippet": {
      "file": "game.py",
      "start": 236,
      "end": 253,
      "code": "    def unmask_node(self, state: GraphState, config: RunnableConfig) -> GraphState:\n        \"\"\"Seer secretly investigates one player during the night.\n\n        Moderator check: the seer receives ONLY the binary wolf/not-wolf\n        answer — never the exact role. The result is piped into the\n        Seer object via reveal_and_update().\n        \"\"\"\n        gs = state[\"game\"]\n        player_objects = config.get(\"configurable\", {}).get(\"player_objects\", {})\n        seer_name = gs._seer\n        seer_obj: Seer = player_objects.get(seer_name)\n\n        # Skip if no seer in game or seer has been eliminated\n        if not seer_name or seer_name not in gs._alive_players:\n            gs._phase = Phase.SAVE_OR_POISON\n            return {\"game\": gs}\n\n        # Seer picks a target",
      "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/game.py#L236-L253"
    }
  },
  {
    "id": "save_or_poison",
    "name": "Witch acts",
    "group": "Night",
    "x": 87,
    "y": 15,
    "title": "Actions depend on remaining resources.",
    "copy": "The Witch’s player object tracks the save and poison potions. The game records those choices before the combined night outcome is calculated.",
    "mechanism": "The same graph can route past a role with no available action.",
    "snippet": {
      "file": "game.py",
      "start": 284,
      "end": 301,
      "code": "    def save_or_poison_node(self, state: GraphState, config: RunnableConfig) -> GraphState:\n        \"\"\"Witch decides whether to use her save and/or poison potions.\"\"\"\n        gs = state[\"game\"]\n        # Retrieve player objects from the LangGraph config\n        player_objects = config.get(\"configurable\", {}).get(\"player_objects\", {})\n        witch_name = gs._witch\n        witch_obj: Witch = player_objects.get(witch_name)\n\n        # Careful setting for every time this node runs\n        gs._saved = None\n        gs._poisoned = None\n\n        # Transition to the next phase if there is no witch or the witch is dead\n        if not witch_name or witch_name not in gs._alive_players:\n            gs._phase = Phase.RESOLVE_NIGHT\n            return {\"game\": gs}\n\n        round_log = gs._game_summary_log.setdefault(gs._round_num, {})",
      "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/game.py#L284-L301"
    }
  },
  {
    "id": "resolve_night",
    "name": "Resolve night",
    "group": "Moderator",
    "x": 87,
    "y": 43,
    "title": "Python resolves competing actions.",
    "copy": "The moderator combines the wolf target, Guard protection, and Witch actions. Public announcements are then delivered to agents, who update their private beliefs.",
    "mechanism": "The state machine resolves the rules; the LLMs supply decisions.",
    "snippet": {
      "file": "game.py",
      "start": 350,
      "end": 367,
      "code": "    def resolve_night_node(self, state: GraphState, config: RunnableConfig) -> GraphState:\n        \"\"\"Apply elimination/protection/save/poison outcome and broadcast announcement.\"\"\"\n        gs = state[\"game\"]\n\n        killed_players = []\n\n        # Evaluate Wolf Kill\n        if gs._eliminated and gs._eliminated != gs._protected and gs._eliminated != gs._saved:\n            killed_players.append(gs._eliminated)\n\n        # Evaluate Witch Poison (bypasses guard and save)\n        if gs._poisoned:\n            killed_players.append(gs._poisoned)\n\n        # Apply deaths and format announcement\n        if killed_players:\n            # Use set() to remove duplicates just in case wolves and witch targeted the same person\n            killed_players = list(set(killed_players))",
      "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/game.py#L350-L367"
    }
  },
  {
    "id": "check_winner_night",
    "name": "Winner check",
    "group": "Branch",
    "x": 62,
    "y": 43,
    "title": "A conditional edge can end the game here.",
    "copy": "No wolves means a village win. Wolves equalling or outnumbering villagers means a wolf win. Otherwise, the next phase is Debate.",
    "mechanism": "The node changes game._phase; a conditional edge reads that value to route execution.",
    "snippet": {
      "file": "game.py",
      "start": 412,
      "end": 425,
      "code": "    def check_winner_night_node(self, state: GraphState) -> GraphState:\n        \"\"\"Return to day phase or finish game if a faction wins.\"\"\"\n        gs = state[\"game\"]\n        winner = self._compute_current_winner(gs)\n\n        if not winner:\n            gs._phase = Phase.DEBATE\n            tqdm.tqdm.write(\"\\n*** Day ***\")\n        else:\n            gs._phase = Phase.END\n\n        gs._step = 0\n\n        return {\"game\": gs}",
      "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/game.py#L412-L425"
    }
  },
  {
    "id": "debate",
    "name": "Bid & debate",
    "group": "Day",
    "x": 37,
    "y": 43,
    "title": "Concurrent bids select one speaker.",
    "copy": "Eligible agents bid through a ThreadPoolExecutor. The highest bidder speaks; ties are random. The previous speaker is excluded. A low bid or the turn limit advances to Vote.",
    "mechanism": "This node can route back to itself, while listeners update beliefs after a statement.",
    "snippet": {
      "file": "game.py",
      "start": 440,
      "end": 451,
      "code": "        next_possible_speakers = [p for p in gs._alive_players if p != last_speaker]\n        current_bid_turn = []\n        bid_dict = {}\n\n        # 1. Run bids in parallel\n        with ThreadPoolExecutor(max_workers=len(next_possible_speakers)) as executor:\n            futures = {\n                name: executor.submit(player_objects[name].get_bid, debate_log, gs._round_num)\n                for name in next_possible_speakers\n            }\n            for name, future in futures.items():\n                bid, reason = future.result()",
      "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/game.py#L440-L451"
    }
  },
  {
    "id": "vote",
    "name": "Parallel votes",
    "group": "Day",
    "x": 12,
    "y": 43,
    "title": "Many model calls. One tally.",
    "copy": "Living agents vote concurrently. Python counts votes and requires at least ceil(alive / 2) for exile. A plurality tie is broken randomly.",
    "mechanism": "Concurrency is handled explicitly by Python threading inside the graph node.",
    "snippet": {
      "file": "game.py",
      "start": 545,
      "end": 552,
      "code": "        with ThreadPoolExecutor(max_workers=len(gs._alive_players)) as executor:\n            futures = {\n                name: executor.submit(player_objects[name].vote, gs._alive_players, debate_log, gs._round_num)\n                for name in gs._alive_players\n            }\n\n            for name, future in futures.items():\n                target, reasoning = future.result()",
      "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/game.py#L545-L552"
    }
  },
  {
    "id": "exile",
    "name": "Apply exile",
    "group": "Moderator",
    "x": 12,
    "y": 75,
    "title": "An outcome becomes a state transition.",
    "copy": "The chosen player is removed from the living set. The public exile announcement and updated game state then feed the next winner check.",
    "mechanism": "A language response cannot directly edit the living-player set.",
    "snippet": {
      "file": "game.py",
      "start": 620,
      "end": 635,
      "code": "    def exile_node(self, state: GraphState, config: RunnableConfig) -> GraphState:\n        \"\"\"Apply the vote outcome, broadcast announcement, and flush notes to disk.\"\"\"\n        gs = state[\"game\"]\n        player_objects: dict[str, BasePlayer] = config.get(\"configurable\", {}).get(\"player_objects\", {})\n\n        if gs._exiled:\n            # Safely remove the player from the alive list\n            gs._alive_players = [p for p in gs._alive_players if p != gs._exiled]\n\n        # Log the exiled player\n        gs._game_summary_log[gs._round_num][\"day_exiled\"] = gs._exiled\n\n        # Advance State\n        gs._phase = Phase.CHECK_WINNER_DAY\n\n        return {\"game\": gs}",
      "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/game.py#L620-L635"
    }
  },
  {
    "id": "check_winner_day",
    "name": "Winner check",
    "group": "Branch",
    "x": 37,
    "y": 75,
    "title": "Finish the match, or return to night.",
    "copy": "A winner sends the graph to End. Otherwise, the round number increases and execution returns to Eliminate for the next night.",
    "mechanism": "Cyclic rounds are native conditional routing, rather than a fixed sequence of chains.",
    "snippet": {
      "file": "game.py",
      "start": 641,
      "end": 648,
      "code": "        winner = self._compute_current_winner(gs)\n        if not winner:\n            gs._phase = Phase.ELIMINATE\n            gs._round_num += 1  # Advance to the next round (Night phase)\n            game_status = \"After voting, the game continues.\"\n        else:\n            gs._phase = Phase.END\n            game_status = \"After voting, the game ends.\"",
      "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/game.py#L641-L648"
    }
  },
  {
    "id": "end",
    "name": "Review & save",
    "group": "Learning",
    "x": 87,
    "y": 75,
    "title": "Coaching starts after the winner is known.",
    "copy": "When coaching is enabled, the coach reviews the completed record first. All players then update their strategies, and the game writes its logs.",
    "mechanism": "The end node hosts the post-game learning work, then routes to LangGraph END.",
    "snippet": {
      "file": "game.py",
      "start": 778,
      "end": 794,
      "code": "        # 2. Generate coach's feedback and update coach strategy\n        if scenario_config.get(\"coaching\"):\n            if coach_object:\n                tqdm.tqdm.write(\"=> Coach is reviewing the game and writing feedback...\")\n                # Pass the beautifully formatted markdown string to the coach!\n                coach_object.run(formatted_summary_md)\n            else:\n                tqdm.tqdm.write(\"=> WARNING: Coaching is enabled, but no coach object was provided in config.\")\n\n        # 3. Update and write out strategy for ALL players\n        tqdm.tqdm.write(\"=> Players are analyzing their performance and updating strategies...\")\n        with ThreadPoolExecutor(max_workers=len(player_objects)) as executor:\n            threads = [\n                executor.submit(player.update_strategy, formatted_summary_md) for player in player_objects.values()\n            ]\n            for thread in threads:\n                thread.result()",
      "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/game.py#L778-L794"
    }
  }
];
export const codeExcerpts={
  "graph": {
    "file": "game.py",
    "start": 889,
    "end": 918,
    "code": "    def build_graph(self):\n        graph = StateGraph(GraphState)\n\n        graph.add_node(\"eliminate\", self.eliminate_node)\n        graph.add_node(\"protect\", self.protect_node)\n        graph.add_node(\"unmask\", self.unmask_node)\n        graph.add_node(\"save_or_poison\", self.save_or_poison_node)\n        graph.add_node(\"resolve_night\", self.resolve_night_node)\n        graph.add_node(\"check_winner_night\", self.check_winner_night_node)\n        graph.add_node(\"debate\", self.debate_node)\n        graph.add_node(\"vote\", self.vote_node)\n        graph.add_node(\"exile\", self.exile_node)\n        graph.add_node(\"check_winner_day\", self.check_winner_day_node)\n        graph.add_node(\"end\", self.end_node)\n\n        graph.set_entry_point(\"eliminate\")\n\n        graph.add_conditional_edges(\"eliminate\", lambda s: s[\"game\"]._phase.value)\n        graph.add_conditional_edges(\"protect\", lambda s: s[\"game\"]._phase.value)\n        graph.add_conditional_edges(\"unmask\", lambda s: s[\"game\"]._phase.value)\n        graph.add_conditional_edges(\"save_or_poison\", lambda s: s[\"game\"]._phase.value)\n        graph.add_conditional_edges(\"resolve_night\", lambda s: s[\"game\"]._phase.value)\n        graph.add_conditional_edges(\"check_winner_night\", lambda s: s[\"game\"]._phase.value)\n        graph.add_conditional_edges(\"debate\", lambda s: s[\"game\"]._phase.value)\n        graph.add_conditional_edges(\"vote\", lambda s: s[\"game\"]._phase.value)\n        graph.add_conditional_edges(\"exile\", lambda s: s[\"game\"]._phase.value)\n        graph.add_conditional_edges(\"check_winner_day\", lambda s: s[\"game\"]._phase.value)\n        graph.add_edge(\"end\", END)\n\n        return graph.compile()",
    "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/game.py#L889-L918"
  },
  "messages": {
    "file": "players/base_player.py",
    "start": 662,
    "end": 665,
    "code": "        messages = [\n            SystemMessage(content=self._setup_prompt),\n            HumanMessage(content=f\"{strategy_prefix}{prompt}\"),\n        ]",
    "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/players/base_player.py#L662-L665"
  },
  "invoke": {
    "file": "players/base_player.py",
    "start": 679,
    "end": 683,
    "code": "        # Ensure LangChain's local cache is bypassed for this specific call\n        run_config = {\"cache\": False}\n\n        # Pass the config explicitly to the invoke method\n        resp = self._model.invoke(messages, config=run_config, **kwargs).content",
    "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/players/base_player.py#L679-L683"
  },
  "parse": {
    "file": "players/base_player.py",
    "start": 695,
    "end": 707,
    "code": "        # This regex looks for everything from the first '{' to the last '}'\n        # re.DOTALL allows it to match across multiple lines\n        match = re.search(r\"(\\{.*\\})\", clean_resp, re.DOTALL)\n\n        if match:\n            clean_resp = match.group(1)\n\n        # 2. Attempt to parse the cleaned string\n        try:\n            result = json.loads(clean_resp)\n        except json.JSONDecodeError:\n            # Fallback if it is still irreparably broken\n            result = {\"raw\": resp}",
    "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/players/base_player.py#L695-L707"
  },
  "validate": {
    "file": "players/seer.py",
    "start": 121,
    "end": 140,
    "code": "        # Validation: must be in available_targets\n        if target not in available_targets:\n            # 1st Fallback: Raw text extraction\n            if \"raw\" in resp:\n                for p in available_targets:\n                    if p in resp[\"raw\"]:\n                        target = p\n                        analysis = \"Extracted target from raw text due to JSON failure.\"\n                        resp[\"target\"] = target\n                        resp[\"analysis\"] = analysis\n                        break\n            \n            # 2nd Fallback: Random selection\n            if target not in available_targets:\n                import random\n                target = random.choice(target_pool)\n                analysis = \"Forced random target due to invalid LLM response.\"\n                resp[\"target\"] = target\n                resp[\"analysis\"] = analysis\n                resp[\"fallback\"] = analysis",
    "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/players/seer.py#L121-L140"
  },
  "confirmed": {
    "file": "players/seer.py",
    "start": 182,
    "end": 183,
    "code": "        # Append-only: never mutated after this point\n        self._investigations.append({\"player\": player_name, \"is_wolf\": is_wolf})",
    "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/players/seer.py#L182-L183"
  },
  "persist": {
    "file": "players/base_player.py",
    "start": 902,
    "end": 903,
    "code": "        write_to_file(self._strategy_path, strategy)\n        self._setup_prompt = self._build_setup_prompt(strategy)",
    "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/players/base_player.py#L902-L903"
  },
  "coach": {
    "file": "players/coach.py",
    "start": 184,
    "end": 194,
    "code": "        self._evaluate_directives_uptake(game_record)\n\n        # Step 2: coach updates its own meta-strategy\n        self._update_coach_strategy(game_record)\n\n        # Step 3: coach writes prose feedback for players (READ by villagers)\n        self._generate_coach_feedback(game_record)\n\n        # Step 4: coach parses its own feedback into structured directives\n        #         (READ by next game's evaluator only). Must run AFTER step 3.\n        self._generate_structured_directives(game_record)",
    "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/players/coach.py#L184-L194"
  },
  "provider": {
    "file": "utils.py",
    "start": 45,
    "end": 52,
    "code": "    # 3. DeepInfra (Default Fallback)\n    if api_key == os.environ.get(\"DEEPINFRA_API_KEY\"):\n        return ChatOpenAI(\n            model=model_name,\n            api_key=os.environ[\"DEEPINFRA_API_KEY\"],\n            base_url=\"https://api.deepinfra.com/v1/openai\",\n            **config # Make sure config is passed here too!\n        )",
    "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/utils.py#L45-L52"
  },
  "baseline": {
    "file": "players/base_player.py",
    "start": 777,
    "end": 794,
    "code": "        sources: List[str] = []\n\n        if self._self_analyze:\n            sources.append(\n                \"=== Your Own Game Analysis ===\\n\"\n                f\"What happened this game from your point of view:\\n{game_record}\\n\"\n                \"You are now entering a critical self-reflection phase before the next game begins. Your primary objective is to review the events of the last match, analyze player behaviors, and strategically adapt to ensure victory next time.\"\n            )\n\n        if self._coaching:\n            feedback = self._coach_feedback\n            if feedback:\n                sources.append(f\"=== Coach Feedback ===\\nAn expert coach has observed the entire game and provided feedback from an external perspective. You must synthesize your own reflections with this coach's guidance to optimize your new strategy.\\n{feedback}\")\n\n        if current_strategy:\n            sources.append(f\"=== Your Current Strategy ===\\n{current_strategy}\")\n\n        context = \"\\n\\n\".join(sources)",
    "url": "https://github.com/hiimnhan/scc452-badass-werewolf/blob/3ee1d2005f99a6849c1a76f5f35159a8df52248c/players/base_player.py#L777-L794"
  }
};

