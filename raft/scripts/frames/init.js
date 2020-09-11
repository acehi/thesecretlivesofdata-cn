
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./playground", "./title", "./intro", "./overview", "./election", "./replication", "./conclusion"],
    function (playground, title, intro, overview, election, replication, conclusion) {
        return function (player) {
            // player.frame("playground", "Playground", playground);
            player.frame("home", "Home", title);
            player.frame("intro", "什么是分布式共识?", intro);
            player.frame("overview", "协议概述", overview);
            player.frame("election", "Leader的选举过程", election);
            player.frame("replication", "日志复制", replication);
            player.frame("conclusion", "其他", conclusion);
        };
    });
