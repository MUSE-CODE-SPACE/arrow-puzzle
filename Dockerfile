FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY games/ /usr/share/nginx/html/games/
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
