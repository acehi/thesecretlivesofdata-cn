
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["../model/log_entry"], function (LogEntry) {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout(),
            model = function() { return frame.model(); },
            client = function(id) { return frame.model().clients.find(id); },
            node = function(id) { return frame.model().nodes.find(id); },
            wait = function() { var self = this; model().controls.show(function() { player.play(); self.stop(); }); };

        frame.after(1, function() {
            model().nodeLabelVisible = false;
            model().clear();
            model().nodes.create("a");
            model().nodes.create("b");
            model().nodes.create("c");
            layout.invalidate();
        })

        .after(800, function () {
            model().subtitle = '<h2> <em> Raft </em> 是用于实施分布式共识的协议。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>让我们看一下它的工作原理。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(100, function () {
            frame.snapshot();
            model().zoom([node("b")]);
            model().subtitle = '<h2>一个节点可以处于以下三种状态之一：</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            node("b")._state = "follower";
            model().subtitle = '<h2> <em> 跟随者(Follower) </em> 状态，</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            node("b")._state = "candidate";
            model().subtitle = '<h2> <em> 候选人(Candidate) </em> 状态，</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            node("b")._state = "leader";
            model().subtitle = '<h2>或者 <em> 领导者(Leader) </em> 状态。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()

        .after(300, function () {
            frame.snapshot();
            model().zoom(null);
            node("b")._state = "follower";
            model().subtitle = '<h2>我们所有的节点都是从跟随者状态开始的。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>如果跟随者没有收到领导者的信息，那么他们可以成为候选人。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, function () {
            node("a")._state = "candidate";
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>然后，候选人从其他节点请求投票。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, function () {
            model().send(node("a"), node("b"), {type:"RVREQ"})
            model().send(node("a"), node("c"), {type:"RVREQ"})
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>其他节点将投票回复。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(300, function () {
            model().send(node("b"), node("a"), {type:"RVRSP"}, function () {
                node("a")._state = "leader";
                layout.invalidate();
            })
            model().send(node("c"), node("a"), {type:"RVRSP"}, function () {
                node("a")._state = "leader";
                layout.invalidate();
            })
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>获得最多节点投票的候选人，就成为领导者。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>这个过程叫做 <em> Leader的选举过程 </em> 。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>系统的所有更改现在都通过领导者。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle += " ";
            model().clients.create("x");
            layout.invalidate();
        })
        .after(1000, function () {
            client("x")._value = "5";
            layout.invalidate();
        })
        .after(500, function () {
            model().send(client("x"), node("a"), null, function () {
                node("a")._log.push(new LogEntry(model(), 1, 1, "SET 5"));
                layout.invalidate();
            });
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>每次更改都在节点日志中的添加记录。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>该日志记录当前没有提交，所以不会更新节点的值。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(300, function () {
            frame.snapshot();
            model().send(node("a"), node("b"), {type:"AEREQ"}, function () {
                node("b")._log.push(new LogEntry(model(), 1, 1, "SET 5"));
                layout.invalidate();
            });
            model().send(node("a"), node("c"), {type:"AEREQ"}, function () {
                node("c")._log.push(new LogEntry(model(), 1, 1, "SET 5"));
                layout.invalidate();
            });
            model().subtitle = '<h2>要提交记录，节点首先将其复制到跟随者节点...</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().send(node("b"), node("a"), {type:"AEREQ"}, function () {
                node("a")._commitIndex = 1;
                node("a")._value = "5";
                layout.invalidate();
            });
            model().send(node("c"), node("a"), {type:"AEREQ"});
            model().subtitle = '<h2>然后领导者等待，直到大多数节点都记完了这条记录。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1000, function () {
            node("a")._commitIndex = 1;
            node("a")._value = "5";
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>现在，该记录已提交到领导者节点上，并且节点状态为“ 5 ”。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().send(node("a"), node("b"), {type:"AEREQ"}, function () {
                node("b")._value = "5";
                node("b")._commitIndex = 1;
                layout.invalidate();
            });
            model().send(node("a"), node("c"), {type:"AEREQ"}, function () {
                node("c")._value = "5";
                node("c")._commitIndex = 1;
                layout.invalidate();
            });
            model().subtitle = '<h2>然后领导者通知跟随者该记录已提交。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>现在，集群已就系统状态达成共识。</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(300, function () {
            frame.snapshot();
            model().subtitle = '<h2>这个过程叫做 <em> 日志复制 </em></h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(300, function () {
            frame.snapshot();
            player.next();
        })


        player.play();
    };
});
