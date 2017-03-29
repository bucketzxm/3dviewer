FROM ubuntu
MAINTAINER bucketzxm

RUN sed -i 's/archive.ubuntu.com/mirrors.shuosc.org/g' /etc/apt/sources.list
RUN apt-get update
RUN apt-get -y upgrade

RUN apt-get install -y python3