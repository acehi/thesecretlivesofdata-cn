
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout(),
            model = function() { return frame.model(); },
            client = function(id) { return frame.model().clients.find(id); },
            node = function(id) { return frame.model().nodes.find(id); },
            cluster = function(value) { model().nodes.toArray().forEach(function(node) { node.cluster(value); }); },
            wait = function() { var self = this; model().controls.show(function() { self.stop(); }); },
            subtitle = function(s, pause) { model().subtitle = s + model().controls.html(); layout.invalidate(); if (pause === undefined) { model().controls.show() }; };

        //------------------------------
        // Title
        //------------------------------
        frame.after(1, function() {
            model().clear();
            layout.invalidate();
        })
        .after(500, function () {
            frame.model().title = '<h2 style="visibility:visible">Leader的选举过程</h1>'
                                + '<br/>' + frame.model().controls.html();
            layout.invalidate();
        })
        .after(200, wait).indefinite()
        .after(500, function () {
            model().title = "";
            layout.invalidate();
        })

        //------------------------------
        // Initialization
        //------------------------------
        .after(300, function () {
            model().nodes.create("A").init();
            model().nodes.create("B").init();
            model().nodes.create("C").init();
            cluster(["A", "B", "C"]);
        })

        //------------------------------
        // Election Timeout
        //------------------------------
        .after(1, function () {
            model().ensureSingleCandidate();
            model().subtitle = '<h2>在Raft中，有两个超时设置可控制选举。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(model().electionTimeout / 2, function() { model().controls.show(); })
        .after(100, function () {
            subtitle('<h2>首先是 <span style="color:green"> 选举超时</span> 。</h2>');
        })
        .after(1, function() {
            subtitle('<h2>选举超时是指追随者成为候选人之前所等待的时间。</h2>');
        })
        .after(1, function() {
            subtitle('<h2>选举超时时间随机设置在150毫秒至300毫秒之间。</h2>');
        })
        .after(1, function() {
            subtitle("", false);
        })

        //------------------------------
        // Candidacy
        //------------------------------
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "candidate");
        })
        .after(1, function () {
            subtitle('<h2>选举超时后，跟随者成为候选人并开始新一轮 <em> 选举任期 </em> ...</h2>');
        })
        .after(1, function () {
            subtitle('<h2>...为自己投票...</h2>');
        })
        .after(model().defaultNetworkLatency * 0.25, function () {
            subtitle('<h2>...并向其他节点发送 <em> 请求投票 </em> 消息。</h2>');
        })
        .after(model().defaultNetworkLatency, function () {
            subtitle('<h2>如果接收的节点在这个任期内还没有投票，那么它将投票给候选人...</h2>');
        })
        .after(1, function () {
            subtitle('<h2>...然后这个节点重置它的选举超时</h2>');
        })


        //------------------------------
        // Leadership & heartbeat timeout.
        //------------------------------
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "leader");
        })
        .after(1, function () {
            subtitle('<h2>一旦候选人获得多数票，它就会成为领导者。</h2>');
        })
        .after(model().defaultNetworkLatency * 0.25, function () {
            subtitle('<h2>领导者开始向其跟随者发送 <em> 追加条目(append entries) </em> 消息。</h2>');
        })
        .after(1, function () {
            subtitle('<h2>这些消息以<span style="color:red"> 心跳超时 </span>指定的时间间隔发送。</h2>');
        })
        .after(model().defaultNetworkLatency, function () {
            subtitle('<h2>Followers then respond to each <em>Append Entries</em> message.</h2>');
            subtitle('<h2>然后跟随者响应每个<em> 追加条目(Append Entries) </em>消息。</h2>');
        })
        .after(1, function () {
            subtitle('', false);
        })
        .after(model().heartbeatTimeout * 2, function () {
            subtitle('<h2>此选举任期将持续到跟随者停止接收心跳并成为候选人为止。</h2>', false);
        })
        .after(100, wait).indefinite()
        .after(1, function () {
            subtitle('', false);
        })

        //------------------------------
        // Leader re-election
        //------------------------------
        .after(model().heartbeatTimeout * 2, function () {
            subtitle('<h2>让我们停止领导节者，并观察重新选举。</h2>', false);
        })
        .after(100, wait).indefinite()
        .after(1, function () {
            subtitle('', false);
            model().leader().state("stopped")
        })
        .after(model().defaultNetworkLatency, function () {
            model().ensureSingleCandidate()
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "leader");
        })
        .after(1, function () {
            subtitle('<h2>节点 ' + model().leader().id + ' 是当前任期 (Term ' + model().leader().currentTerm() + ') 的领导者。</h2>', false);
        })
        .after(1, wait).indefinite()

        //------------------------------
        // Split Vote
        //------------------------------
        .after(1, function () {
            subtitle('<h2>要获得多数票，可以确保每个任期只能选出一位领导者。</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>如果两个节点同时成为候选人，则可能是发生了平票。</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>让我们看一个平票的例子...</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('', false);
            model().nodes.create("D").init().currentTerm(node("A").currentTerm());
            cluster(["A", "B", "C", "D"]);

            // Make sure two nodes become candidates at the same time.
            model().resetToNextTerm();
            var nodes = model().ensureSplitVote();

            // Increase latency to some nodes to ensure obvious split.
            model().latency(nodes[0].id, nodes[2].id, model().defaultNetworkLatency * 1.25);
            model().latency(nodes[1].id, nodes[3].id, model().defaultNetworkLatency * 1.25);
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "candidate");
        })
        .after(model().defaultNetworkLatency * 0.25, function () {
            subtitle('<h2>两个节点都开始同一任期的选举...</h2>');
        })
        .after(model().defaultNetworkLatency * 0.75, function () {
            subtitle('<h2>...每个都先到达一个跟随者节点。</h2>');
        })
        .after(model().defaultNetworkLatency, function () {
            subtitle('<h2>现在，每位候选人都有2票，并且在这个任期中将无法获得更多选票。</h2>');
        })
        .after(1, function () {
            subtitle('<h2>节点将等待新的选举，然后重试。</h2>', false);
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "leader");
        })
        .after(1, function () {
            model().resetLatencies();
            subtitle('<h2>节点 ' + model().leader().id + ' 在任期 ' + model().leader().currentTerm() + ' 内获得多数票因此成为领导者.</h2>', false);
        })
        .after(1, wait).indefinite()

        .then(function() {
            player.next();
        })


        player.play();
    };
});
