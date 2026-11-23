# KorvexIT website

Serve the repository root with `python3 -m http.server 8765 --bind 127.0.0.1` and open http://127.0.0.1:8765/. The site uses static HTML routes with shared CSS and JavaScript. There is no build step.

The consultation form sends enquiries through the existing FormSubmit endpoint. Delivery requires the recipient to have activated that address with FormSubmit.

After approval, publish the root files through the repository’s existing GitHub Pages configuration. Keep CNAME for the custom domain.
