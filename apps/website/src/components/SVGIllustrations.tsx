/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, useTime, useTransform } from "motion/react";
import logoImage from "../assets/images/dealschool_logo_1781074477214.jpg";

// Shared micro-floating motion animation props
export const floatingYAnimation = {
  animate: {
    y: [0, -6, 0],
  },
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// Glow pulse for the gold orb motif
const glowVariants = {
  animate: {
    boxShadow: [
      "0 0 12px rgba(212, 166, 42, 0.4)",
      "0 0 24px rgba(212, 166, 42, 0.8)",
      "0 0 12px rgba(212, 166, 42, 0.4)",
    ],
    scale: [1, 1.05, 1],
  },
};

// 1. STAIRCASE ILLUSTRATION (Hero Section)
// Concept: A 3D isometric staircase on the left, leading up to a large board room table lit from within.
// A dynamic gold investment line runs up the staircase towards the light.
export const StaircaseIllustration: React.FC = () => {
  return (
    <motion.div 
      className="relative w-full max-w-[700px] aspect-[16/10] mx-auto flex items-center justify-center p-4 bg-transparent"
      {...floatingYAnimation}
    >
      <svg
        viewBox="0 0 800 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        {/* Background Engineering Grid lines */}
        <g stroke="#0D3B8E" strokeOpacity="0.08" strokeWidth="1">
          <line x1="50" y1="250" x2="750" y2="250" />
          <line x1="100" y1="50" x2="100" y2="450" />
          <line x1="250" y1="50" x2="250" y2="410" />
          <line x1="400" y1="50" x2="400" y2="450" />
          <line x1="550" y1="50" x2="550" y2="450" />
          
          {/* Isometric diag grid lines */}
          <line x1="50" y1="150" x2="750" y2="380" strokeDasharray="4 4" />
          <line x1="50" y1="350" x2="750" y2="120" strokeDasharray="4 4" />
        </g>

        {/* Boardroom Table lit with bright amber glow */}
        <g transform="translate(420, -45)">
          {/* Table shadow */}
          <polygon points="0,150 160,80 320,150 160,220" fill="#0D3B8E" fillOpacity="0.04" />
          
          {/* Table legs */}
          <line x1="40" y1="170" x2="40" y2="230" stroke="#0D3B8E" strokeWidth="6" strokeLinecap="round" />
          <line x1="280" y1="170" x2="280" y2="230" stroke="#0D3B8E" strokeWidth="6" strokeLinecap="round" />
          <line x1="160" y1="200" x2="160" y2="250" stroke="#0D3B8E" strokeOpacity="0.3" strokeWidth="4" />

          {/* Table Plate */}
          <polygon points="10,140 160,70 310,140 160,210" fill="#082C6C" stroke="#0D3B8E" strokeWidth="2" />
          
          {/* Soft inner lighting glowing upward */}
          <polygon points="60,140 160,95 260,140 160,185" fill="#FFEAA7" fillOpacity="0.15" />
          {/* Neon inner core slot */}
          <polygon points="90,140 160,110 230,140 160,170" fill="#FFF" stroke="#FFEAA7" strokeWidth="3" />
        </g>

        {/* 3D Isometric Staircase */}
        <g transform="translate(100, 220)">
          {/* Stairs blocks */}
          {/* Step 1 */}
          <polygon points="50,220 120,220 120,250 50,250" fill="#0D3B8E" fillOpacity="0.08" />
          <polygon points="50,220 120,220 160,195 90,195" fill="#0D3B8E" fillOpacity="0.18" />
          <polygon points="120,220 160,195 160,225 120,250" fill="#0D3B8E" fillOpacity="0.25" />

          {/* Step 2 */}
          <polygon points="90,170 160,170 160,200 90,200" fill="#0D3B8E" fillOpacity="0.12" />
          <polygon points="90,170 160,170 200,145 130,145" fill="#0D3B8E" fillOpacity="0.2" />
          <polygon points="160,170 200,145 200,175 160,200" fill="#0D3B8E" fillOpacity="0.28" />

          {/* Step 3 */}
          <polygon points="130,120 200,120 200,150 130,150" fill="#0D3B8E" fillOpacity="0.14" />
          <polygon points="130,120 200,120 240,95 170,95" fill="#0D3B8E" fillOpacity="0.22" />
          <polygon points="200,120 240,95 240,125 200,150" fill="#0D3B8E" fillOpacity="0.32" />

          {/* Step 4 */}
          <polygon points="170,70 240,70 240,100 170,100" fill="#0D3B8E" fillOpacity="0.16" />
          <polygon points="170,70 240,70 280,45 210,45" fill="#0D3B8E" fillOpacity="0.24" />
          <polygon points="240,70 280,45 280,75 240,100" fill="#0D3B8E" fillOpacity="0.35" />

          {/* Step 5 */}
          <polygon points="210,20 280,20 280,50 210,50" fill="#0D3B8E" fillOpacity="0.18" />
          <polygon points="210,20 280,20 320,0 250,0" fill="#0D3B8E" fillOpacity="0.26" />
          <polygon points="280,20 320,0 320,30 280,50" fill="#0D3B8E" fillOpacity="0.38" />
        </g>

        {/* The Gold Path Line running up the stairs towards the Boardroom Table */}
        <motion.path
          d="M 50 490 L 150 430 L 190 405 L 230 355 L 270 305 L 310 255 L 350 195 C 410 155, 480 125, 580 95"
          stroke="#D4A62A"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop",
            repeatDelay: 1,
            ease: "easeInOut"
          }}
        />

        {/* Gold Glow Pulse at the base and table intersection */}
        <circle cx="580" cy="95" r="7" fill="#D4A62A" />
        <circle cx="580" cy="95" r="16" stroke="#D4A62A" strokeOpacity="0.3" strokeWidth="2">
          <animate attributeName="r" values="7;25;7" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0;1" dur="2.5s" repeatCount="indefinite" />
        </circle>

        {/* Floating text metadata labels - Sequoia/McKinsey style */}
        <g fontFamily="Helvetica, Arial, sans-serif" fontSize="13" fontWeight="bold" letterSpacing="0.06em">
          <text x="70" y="475" fill="#2D3748">ENTRY: AMBITIOUS THINKING</text>
          <text x="240" y="325" fill="#2D3748">ANALYSIS & METRICS</text>
          <text x="580" y="20" fill="#D4A62A" fontWeight="900" textAnchor="middle">DESTINATION: VC BOARDROOM</text>
        </g>
      </svg>
    </motion.div>
  );
};


// 2. CERTIFICATE + KEY ILLUSTRATION (Why DealSchool Section)
export const CertificateKeyIllustration: React.FC = () => {
  return (
    <motion.div 
      className="relative w-full max-w-[450px] aspect-[4/3] mx-auto flex items-center justify-center p-4"
      {...floatingYAnimation}
    >
      <svg
        viewBox="0 0 600 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg"
      >
        {/* Drafting drafting grid */}
        <rect x="10" y="10" width="580" height="430" rx="4" fill="#0D3B8E" fillOpacity="0.02" stroke="#0D3B8E" strokeOpacity="0.05" />
        <path d="M 50 10 L 50 440 M 100 10 L 100 440 M 200 10 L 200 440 M 300 10 L 300 440 M 400 10 L 400 440 M 500 10 L 500 440" stroke="#0D3B8E" strokeOpacity="0.04" strokeWidth="1" />
        <path d="M 10 50 L 590 50 M 10 100 L 590 100 M 10 200 L 590 200 M 10 300 L 590 300 M 10 400 L 590 400" stroke="#0D3B8E" strokeOpacity="0.04" strokeWidth="1" />

        {/* Blueprint Certificate draft */}
        <g transform="translate(60, 60)">
          {/* Main frame */}
          <rect x="0" y="0" width="380" height="260" fill="#FAFAF8" stroke="#0D3B8E" strokeWidth="1.5" />
          <rect x="10" y="10" width="360" height="240" fill="none" stroke="#0D3B8E" strokeOpacity="0.1" strokeWidth="1" />
          
          {/* Certificate headers */}
          <line x1="30" y1="40" x2="180" y2="40" stroke="#0D3B8E" strokeWidth="2.5" />
          <line x1="30" y1="52" x2="110" y2="52" stroke="#0D3B8E" strokeWidth="1.5" />
          
          {/* Body Lines representing certificate information */}
          <line x1="30" y1="90" x2="310" y2="90" stroke="#0D3B8E" strokeOpacity="0.15" strokeWidth="3" />
          <line x1="30" y1="110" x2="350" y2="110" stroke="#0D3B8E" strokeOpacity="0.15" strokeWidth="3" />
          <line x1="30" y1="130" x2="260" y2="130" stroke="#0D3B8E" strokeOpacity="0.15" strokeWidth="3" />

          {/* Authentic Completion Text */}
          <text x="30" y="215" fill="#D4A62A" fontFamily="Helvetica, Arial, sans-serif" fontSize="11" fontWeight="bold" letterSpacing="0.05em">
            COHORT 1 COMPLETION
          </text>
          <text x="30" y="232" fill="#5F6368" fontFamily="Helvetica, Arial, sans-serif" fontSize="9">
            Middha Ventures Fellowship Credentials
          </text>

          {/* Technical Circle Seal in Gold */}
          <circle cx="310" cy="200" r="22" fill="none" stroke="#D4A62A" strokeWidth="2" strokeDasharray="3 2" />
          <polygon points="310,186 314,196 324,196 316,202 319,212 310,206 301,212 304,202 296,196 306,196" fill="#D4A62A" />
        </g>

        {/* Vintage 3D Key of Boardroom Knowledge */}
        <g transform="translate(340, 160)">
          {/* Shadow of the key */}
          <g opacity="0.05" transform="translate(10, 15)">
            <circle cx="120" cy="50" r="35" fill="#0D3B8E" />
            <rect x="0" y="40" width="100" height="20" rx="3" fill="#0D3B8E" />
            <rect x="-15" y="55" width="20" height="25" fill="#0D3B8E" />
            <rect x="-40" y="55" width="20" height="25" fill="#0D3B8E" />
          </g>

          {/* Key shaft */}
          <rect x="-10" y="42" width="100" height="16" fill="#E2DCD2" stroke="#0D3B8E" strokeWidth="1.5" />
          {/* Key core highlight block in gold */}
          <rect x="10" y="45" width="55" height="10" fill="#D4A62A" />
          
          {/* Key handle (isometric circles) */}
          <circle cx="120" cy="50" r="30" fill="#FAFAF8" stroke="#0D3B8E" strokeWidth="2.5" />
          <circle cx="120" cy="50" r="16" fill="none" stroke="#0D3B8E" strokeWidth="1.5" />
          {/* Geometric divisions on head */}
          <line x1="120" y1="20" x2="120" y2="80" stroke="#0D3B8E" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="90" y1="50" x2="150" y2="50" stroke="#0D3B8E" strokeWidth="1" strokeDasharray="2 2" />
          
          {/* Key teeth */}
          <path d="M -10 50 L -10 85 L -25 85 L -25 58 L -35 58 L -35 85 L -48 85 L -48 50 Z" fill="#E2DCD2" stroke="#0D3B8E" strokeWidth="2" />
          {/* Gold decorative highlights on teeth */}
          <rect x="-21" y="65" width="6" height="15" fill="#D4A62A" />
          <rect x="-44" y="65" width="6" height="15" fill="#D4A62A" />
        </g>
        
        {/* Accent Gold Anchors and Coordinates */}
        <circle cx="60" cy="62" r="4" fill="#D4A62A" />
        <circle cx="440" cy="62" r="4" fill="#D4A62A" />
        <circle cx="60" cy="320" r="4" fill="#D4A62A" />
        <circle cx="440" cy="320" r="4" fill="#D4A62A" />
        
        <circle cx="460" cy="210" r="4" fill="#D4A62A" />
        <line x1="460" y1="210" x2="520" y2="210" stroke="#D4A62A" strokeWidth="1" strokeDasharray="3 3"/>
      </svg>
    </motion.div>
  );
};


// 3. GRAPH / MARKET ANALYSIS ILLUSTRATION (Investment Thinking Section)
// Concept: Gold-centered analytics graph representing quantitative structured analysis.
export const MarketAnalysisIllustration: React.FC = () => {
  return (
    <motion.div 
      className="relative w-full max-w-[480px] aspect-[16/10] mx-auto flex items-center justify-center p-4"
      {...floatingYAnimation}
    >
      <svg
        viewBox="0 0 800 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        {/* Coordinate board */}
        <polygon points="50,250 400,50 750,250 400,450" fill="#0D3B8E" fillOpacity="0.015" stroke="#0D3B8E" strokeOpacity="0.08" strokeWidth="1.5" />
        
        {/* Isometric Grid Networks */}
        <g stroke="#0D3B8E" strokeOpacity="0.03" strokeWidth="1">
          <line x1="100" y1="200" x2="400" y2="400" />
          <line x1="200" y1="150" x2="500" y2="350" />
          <line x1="300" y1="100" x2="600" y2="300" />
          <line x1="400" y1="50" x2="700" y2="250" />
          
          <line x1="700" y1="250" x2="400" y2="400" />
          <line x1="600" y1="200" x2="300" y2="350" />
          <line x1="500" y1="150" x2="200" y2="300" />
          <line x1="400" y1="100" x2="100" y2="250" />
        </g>

        {/* Graph 1 (Background blue/grey mountains representing market sizes) */}
        <g fill="#0D3B8E" fillOpacity="0.06" stroke="#0D3B8E" strokeOpacity="0.15" strokeWidth="1">
          <polygon points="120,240 180,180 240,240" />
          <polygon points="200,240 280,130 360,240" />
          <polygon points="460,250 510,190 560,250" />
          <polygon points="520,250 610,120 700,250" />
        </g>

        {/* Central Core Pillar in Gold representing anchor decisions */}
        <g transform="translate(400, 210)">
          {/* Deep shadow */}
          <ellipse cx="0" cy="55" rx="20" ry="10" fill="#D4A62A" fillOpacity="0.25" />
          
          {/* Glowing cylinder pillar */}
          <path d="M -15,-30 L 15,-30 L 15,50 L -15,50 Z" fill="#D4A62A" />
          <ellipse cx="0" cy="-30" rx="15" ry="7" fill="#FAFAF8" />
          <ellipse cx="0" cy="50" rx="15" ry="7" fill="#D4A62A" />
          
          {/* Laser-cross indicators */}
          <line x1="-300" y1="50" x2="300" y2="50" stroke="#D4A62A" strokeWidth="2.5" />
          <line x1="0" y1="-150" x2="0" y2="200" stroke="#D4A62A" strokeWidth="2.5" />
        </g>

        {/* 3D scattered blocks representing data nodes */}
        {/* Node 1: Indigo/Blue Block */}
        <g transform="translate(220, 280)">
          <polygon points="0,20 30,5 60,20 30,35" fill="#0D3B8E" stroke="#082C6C" strokeWidth="1" />
          <polygon points="0,20 30,35 30,70 0,55" fill="#082C6C" />
          <polygon points="30,35 60,20 60,55 30,70" fill="#0D3B8E" />
        </g>

        {/* Node 2: Medium Slate/Blue Block */}
        <g transform="translate(540, 160)">
          <polygon points="0,15 25,3 50,15 25,27" fill="#0D3B8E" fillOpacity="0.5" stroke="#0D3B8E" strokeWidth="1" />
          <polygon points="0,15 25,27 25,50 0,38" fill="#0D3B8E" fillOpacity="0.4" />
          <polygon points="25,27 50,15 50,38 25,50" fill="#082C6C" fillOpacity="0.7" />
        </g>

        {/* Quantitative trend graphs (Gold line charts mapping insights) */}
        <motion.path
          d="M 120,380 Q 280,320 400,260 T 680,180"
          stroke="#D4A62A"
          strokeWidth="3.5"
          strokeDasharray="5 3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Coordinate indicator beacons */}
        <circle cx="280" cy="320" r="5" fill="#D4A62A" />
        <circle cx="585" cy="200" r="5" fill="#D4A62A" />
        <circle cx="400" cy="260" r="7" fill="#D4A62A" />

        {/* Labels */}
        <g fill="#5F6368" fontFamily="Helvetica, Arial, sans-serif" fontSize="11" letterSpacing="0.05em">
          <text x="360" y="160" textAnchor="end">LIQUIDITY MULTIPLES</text>
          <text x="440" y="310">REVENUE COHORTS</text>
          <text x="400" y="480" textAnchor="middle">QUANTITATIVE SYSTEM CO-EFFICIENTS</text>
        </g>
      </svg>
    </motion.div>
  );
};


// 4. COLLABORATION ILLUSTRATION (Fellowship Experience Section)
// Concept: Three geometric visual entities exchanging/passing a prominent gold orb.
export const CollaborationIllustration: React.FC = () => {
  return (
    <motion.div 
      className="relative w-full max-w-[450px] aspect-[4/3] mx-auto flex items-center justify-center p-4"
      {...floatingYAnimation}
    >
      <svg
        viewBox="0 0 600 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        {/* Isometric workspace platform */}
        <polygon points="100,230 300,80 500,230 300,380" fill="#0D3B8E" fillOpacity="0.04" stroke="#0D3B8E" strokeOpacity="0.15" strokeWidth="1.5" />
        
        {/* Linear geometric projection rails */}
        <g stroke="#0D3B8E" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="3 3">
          <line x1="300" y1="80" x2="300" y2="380" />
          <line x1="100" y1="230" x2="500" y2="230" />
          <line x1="200" y1="155" x2="400" y2="305" />
          <line x1="400" y1="155" x2="200" y2="305" />
        </g>

        {/* Central Glowing Gold Orb (The Idea / Insight exchange) */}
        <g className="relative">
          <motion.circle
            cx="300"
            cy="210"
            r="16"
            fill="#D4A62A"
            variants={glowVariants}
            animate="animate"
          />
          <circle cx="300" cy="210" r="32" stroke="#D4A62A" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="5 5">
            <animate attributeName="r" values="24;45;24" dur="3.5s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Figure 1 (Left - Analyst/Sourcing) */}
        <g transform="translate(160, 200)">
          {/* Stand point shadow */}
          <ellipse cx="0" cy="50" rx="20" ry="10" fill="#0D3B8E" fillOpacity="0.08" />
          
          {/* Low-poly technical avatar body */}
          <polygon points="-12,40 12,40 18,5 -18,5" fill="#0D3B8E" />
          <polygon points="-18,5 18,5 0,-25" fill="#082C6C" />
          {/* Head */}
          <circle cx="0" cy="-40" r="10" fill="#0F172A" />
          {/* Connecting vector link to core */}
          <line x1="12" y1="-10" x2="115" y2="5" stroke="#D4A62A" strokeWidth="1.5" strokeDasharray="2 2" />
        </g>

        {/* Figure 2 (Right - Researcher/Diligence) */}
        <g transform="translate(440, 200)">
          {/* Stand point shadow */}
          <ellipse cx="0" cy="50" rx="20" ry="10" fill="#0D3B8E" fillOpacity="0.08" />
          
          {/* Body */}
          <polygon points="-12,40 12,40 18,5 -18,5" fill="#0D3B8E" />
          <polygon points="-18,5 18,5 0,-25" fill="#082C6C" />
          {/* Head */}
          <circle cx="0" cy="-40" r="10" fill="#0F172A" />
          {/* Connecting vector link to core */}
          <line x1="-12" y1="-10" x2="-115" y2="5" stroke="#D4A62A" strokeWidth="1.5" strokeDasharray="2 2" />
        </g>

        {/* Figure 3 (Top - Partner/Underwriter) */}
        <g transform="translate(300, 110)">
          {/* Stand point shadow */}
          <ellipse cx="0" cy="40" rx="16" ry="8" fill="#0D3B8E" fillOpacity="0.08" />
          
          {/* Body */}
          <polygon points="-10,30 10,30 15,2 -15,2" fill="#082C6C" />
          <polygon points="-15,2 15,2 0,-20" fill="#0D3B8E" />
          {/* Head */}
          <circle cx="0" cy="-32" r="9" fill="#082C6C" />
          {/* Connecting vector link to core */}
          <line x1="0" y1="10" x2="0" y2="80" stroke="#D4A62A" strokeWidth="1.5" strokeDasharray="2 2" />
        </g>

        {/* Connecting flow arrows */}
        <path d="M 180,180 Q 300,150 420,180" stroke="#D4A62A" strokeWidth="1.5" fill="none" strokeOpacity="0.4" />
        <path d="M 420,240 Q 300,300 180,240" stroke="#D4A62A" strokeWidth="1.5" fill="none" strokeOpacity="0.4" />

        {/* Sourcing and decision headers */}
        <g fill="#5F6368" fontFamily="Helvetica, Arial, sans-serif" fontSize="10" letterSpacing="0.05em">
          <text x="120" y="270" textAnchor="middle">SOURCING INPUTS</text>
          <text x="480" y="270" textAnchor="middle">DILIGENCE INSIGHTS</text>
          <text x="300" y="60" textAnchor="middle">COMMITTEE DECISIVE CONVICTION</text>
        </g>
      </svg>
    </motion.div>
  );
};


// 5. CIRCLE PERSON ILLUSTRATION (Investment Memo Process Section)
// Concept: A single person standing atop a stack of blocks holding up a highly glowing gold orb.
export const CirclePersonIllustration: React.FC = () => {
  return (
    <motion.div 
      className="relative w-full max-w-[450px] aspect-[4/3] mx-auto flex items-center justify-center p-4"
      {...floatingYAnimation}
    >
      <svg
        viewBox="0 0 600 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        {/* Abstract structural grid board */}
        <line x1="100" y1="360" x2="500" y2="360" stroke="#0D3B8E" strokeOpacity="0.1" strokeWidth="1.5" />
        <line x1="150" y1="380" x2="450" y2="380" stroke="#0D3B8E" strokeOpacity="0.05" strokeWidth="1" />
        <line x1="300" y1="100" x2="300" y2="400" stroke="#0D3B8E" strokeOpacity="0.04" strokeWidth="1" strokeDasharray="3 3" />

        {/* 3D stacked block array bottom pedestal */}
        <g transform="translate(250, 300)">
          {/* Block bottom */}
          <polygon points="0,20 50,0 100,20 50,40" fill="#0D3B8E" fillOpacity="0.15" />
          <polygon points="0,20 50,40 50,80 0,60" fill="#082C6C" />
          <polygon points="50,40 100,20 100,60 50,80" fill="#0D3B8E" />

          {/* Block middle */}
          <g transform="translate(15, -30)">
            <polygon points="0,15 35,0 70,15 35,30" fill="#0D3B8E" fillOpacity="0.3" stroke="#0D3B8E" strokeWidth="0.5" />
            <polygon points="0,15 35,30 35,60 0,45" fill="#0D3B8E" />
            <polygon points="35,30 70,15 70,45 35,60" fill="#082C6C" />
          </g>

          {/* Block top candidate */}
          <g transform="translate(30, -55)">
            <polygon points="0,10 20,0 40,10 20,20" fill="#0D3B8E" />
            <polygon points="0,10 20,20 20,35 0,25" fill="#082C6C" />
            <polygon points="20,20 40,10 40,25 20,35" fill="#0D3B8E" />
          </g>
        </g>

        {/* The Figure standing on top block holding the orb */}
        <g transform="translate(300, 215)">
          {/* Shadow */}
          <ellipse cx="0" cy="30" rx="10" ry="5" fill="#0D3B8E" fillOpacity="0.3" />

          {/* Body structure looking upward */}
          <line x1="0" y1="30" x2="0" y2="0" stroke="#082C6C" strokeWidth="4.5" strokeLinecap="round" />
          {/* Legs */}
          <line x1="0" y1="30" x2="-8" y2="45" stroke="#082C6C" strokeWidth="3" strokeLinecap="round" />
          <line x1="0" y1="30" x2="8" y2="45" stroke="#082C6C" strokeWidth="3" strokeLinecap="round" />
          {/* Arms raised up holding the Sphere */}
          <line x1="0" y1="5" x2="-18" y2="-18" stroke="#082C6C" strokeWidth="3" strokeLinecap="round" />
          <line x1="0" y1="5" x2="18" y2="-18" stroke="#082C6C" strokeWidth="3" strokeLinecap="round" />
          {/* Head */}
          <circle cx="0" cy="-6" r="6" fill="#082C6C" />
        </g>

        {/* The Massive Pulsative Orb held in high leverage positions */}
        <g transform="translate(300, 180)">
          <motion.circle
            cx="0"
            cy="0"
            r="25"
            fill="#D4A62A"
            variants={glowVariants}
            animate="animate"
          />
          {/* Secondary translucent ring */}
          <circle cx="0" cy="0" r="45" stroke="#D4A62A" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 2">
            <animate attributeName="r" values="35;60;35" dur="4s" repeatCount="indefinite" />
          </circle>

          {/* Upward expanding radiating vector signals representing thesis spreading */}
          <g stroke="#D4A62A" strokeWidth="1.5" strokeOpacity="0.6">
            <path d="M -15,-30 Q -60,-80 -100,-110" strokeDasharray="3 3"/>
            <path d="M 0,-35 Q 0,-100 0,-130" strokeDasharray="3 3" />
            <path d="M 15,-30 Q 60,-80 100,-110" strokeDasharray="3 3" />
            
            {/* Arrow terminations */}
            <polygon points="-100,-110 -93,-111 -99,-104" fill="#D4A62A" />
            <polygon points="0,-130 -5,-123 5,-123" fill="#D4A62A" />
            <polygon points="100,-110 99,-104 93,-111" fill="#D4A62A" />
          </g>
        </g>

        {/* Labels */}
        <g fill="#5F6368" fontFamily="Helvetica, Arial, sans-serif" fontSize="11" letterSpacing="0.05em">
          <text x="300" y="420" textAnchor="middle">INSIGHTS ACCUMULATE TO CONVICTION</text>
          <text x="170" y="315" textAnchor="end">RAW DATA</text>
          <text x="430" y="315" textAnchor="start">INVESTMENT PORTFOLIO</text>
        </g>
      </svg>
    </motion.div>
  );
};


// 6. DEAL SCHOOL OFFICIAL LOGO (Highly polished modern mortarboard + arrow + chain link)
export const DealSchoolLogo: React.FC<{ className?: string }> = ({ className = "h-10 w-auto" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* High precision logo image asset replacing previous SVG */}
      <img
        src={logoImage}
        alt="DealSchool Logo"
        className="h-9 w-9 md:h-10 md:w-10 rounded-sm object-contain flex-shrink-0"
        referrerPolicy="no-referrer"
      />
      
      {/* Brand Text styling - Sequoia / McKinsey premium report look */}
      <div className="flex flex-col select-none">
        <span className="font-serif tracking-widest font-black leading-none text-brand-text text-base md:text-lg">
          DEAL<span className="text-brand-accent">SCHOOL</span>
        </span>
        <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-brand-neutral font-medium leading-none mt-1">
          Venture Fellowship
        </span>
      </div>
    </div>
  );
};
