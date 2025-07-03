ARTIFACTS_BUCKET_NAME=artifacts.getrewards
REGION=us-east-1
BACKEND_ARTIFACTS_NAME=getrewards-backend
EVM_ARTIFACTS_NAME=getrewards-backend-evm-event-handler
TAX_FORMS_ARTIFACTS_NAME=getrewards-tax-forms
MONITOR_VAULTS_ARTIFACTS_NAME=getrewards-monitor-vaults
REMOVE_SECURITY_CODE_ARTIFACTS_NAME=getrewards-remove-security-code
ITERATOR_ARTIFACTS_NAME=getrewards-iterator
VAULTS_CREATOR_ARTIFACTS_NAME=getrewards-vaults-creator

###############################################
############# Internal Targets ################
###############################################


.PHONY: upload-artifact
.upload-artifact:
	aws s3 cp $(BACKEND_ARTIFACTS_NAME).zip s3://$(ARTIFACTS_BUCKET_NAME)/$(ENV_NAME)/$(BACKEND_ARTIFACTS_NAME)/ --region $(REGION)
	aws s3 cp $(EVM_ARTIFACTS_NAME).zip s3://$(ARTIFACTS_BUCKET_NAME)/$(ENV_NAME)/$(EVM_ARTIFACTS_NAME)/ --region $(REGION)
	aws s3 cp $(TAX_FORMS_ARTIFACTS_NAME).zip s3://$(ARTIFACTS_BUCKET_NAME)/$(ENV_NAME)/$(TAX_FORMS_ARTIFACTS_NAME)/ --region $(REGION)
	aws s3 cp $(MONITOR_VAULTS_ARTIFACTS_NAME).zip s3://$(ARTIFACTS_BUCKET_NAME)/$(ENV_NAME)/$(MONITOR_VAULTS_ARTIFACTS_NAME)/ --region $(REGION)
	aws s3 cp $(REMOVE_SECURITY_CODE_ARTIFACTS_NAME).zip s3://$(ARTIFACTS_BUCKET_NAME)/$(ENV_NAME)/$(REMOVE_SECURITY_CODE_ARTIFACTS_NAME)/ --region $(REGION)
	aws s3 cp $(ITERATOR_ARTIFACTS_NAME).zip s3://$(ARTIFACTS_BUCKET_NAME)/$(ENV_NAME)/$(ITERATOR_ARTIFACTS_NAME)/ --region $(REGION)
	aws s3 cp $(VAULTS_CREATOR_ARTIFACTS_NAME).zip s3://$(ARTIFACTS_BUCKET_NAME)/$(ENV_NAME)/$(VAULTS_CREATOR_ARTIFACTS_NAME)/ --region $(REGION)

###############################################
################## Targets ####################
###############################################

out/ts: $(shell git ls-files "./src/*.[jt]s" --full-name)
	rm -r -f dist && \
	node --max-old-space-size=8192 ./node_modules/.bin/nest build && \
	npm run esbuild && \
	touch out/ts

$(BACKEND_ARTIFACTS_NAME).zip: out/ts
	rm -r -f $(BACKEND_ARTIFACTS_NAME).zip && \
	cp -r node_modules/pdfkit/js/data out/application/data && \
	cp -r src/assets/forms out/application/data/forms && \
	zip $(BACKEND_ARTIFACTS_NAME).zip -r out/application node_modules/swagger-ui-dist

$(EVM_ARTIFACTS_NAME).zip: out/ts
	rm -r -f $(EVM_ARTIFACTS_NAME).zip && \
	zip $(EVM_ARTIFACTS_NAME).zip -r out/handleEvmTransactionEvent


$(TAX_FORMS_ARTIFACTS_NAME).zip: out/ts
	rm -r -f $(TAX_FORMS_ARTIFACTS_NAME).zip && \
	cp -r node_modules/pdfkit/js/data out/generate1099TaxForms/data && \
	cp -r src/assets/forms out/generate1099TaxForms/data/forms && \
	zip $(TAX_FORMS_ARTIFACTS_NAME).zip -r out/generate1099TaxForms

$(MONITOR_VAULTS_ARTIFACTS_NAME).zip: out/ts
	rm -r -f $(MONITOR_VAULTS_ARTIFACTS_NAME).zip && \
	zip $(MONITOR_VAULTS_ARTIFACTS_NAME).zip -r out/monitorVaults

$(REMOVE_SECURITY_CODE_ARTIFACTS_NAME).zip: out/ts
	rm -r -f $(REMOVE_SECURITY_CODE_ARTIFACTS_NAME).zip && \
	zip $(REMOVE_SECURITY_CODE_ARTIFACTS_NAME).zip -r out/removeSecurityCode

$(ITERATOR_ARTIFACTS_NAME).zip: out/ts
	rm -r -f $(ITERATOR_ARTIFACTS_NAME).zip && \
	zip $(ITERATOR_ARTIFACTS_NAME).zip -r out/iterator

$(VAULTS_CREATOR_ARTIFACTS_NAME).zip: out/ts
	rm -r -f $(VAULTS_CREATOR_ARTIFACTS_NAME).zip && \
	zip $(VAULTS_CREATOR_ARTIFACTS_NAME).zip -r out/createSeparatedVault

################## Stage ####################

.PHONY: stage-upload
stage-upload: ENV_NAME=stage
stage-upload: $(BACKEND_ARTIFACTS_NAME).zip $(EVM_ARTIFACTS_NAME).zip $(TAX_FORMS_ARTIFACTS_NAME).zip $(MONITOR_VAULTS_ARTIFACTS_NAME).zip $(REMOVE_SECURITY_CODE_ARTIFACTS_NAME).zip $(ITERATOR_ARTIFACTS_NAME).zip $(VAULTS_CREATOR_ARTIFACTS_NAME).zip
	@$(MAKE) -s .upload-artifact ENV_NAME=stage

################## Prod ####################

.PHONY: prod-upload
prod-upload: ENV_NAME=prod
prod-upload: $(BACKEND_ARTIFACTS_NAME).zip $(EVM_ARTIFACTS_NAME).zip $(TAX_FORMS_ARTIFACTS_NAME).zip $(MONITOR_VAULTS_ARTIFACTS_NAME).zip $(REMOVE_SECURITY_CODE_ARTIFACTS_NAME).zip $(ITERATOR_ARTIFACTS_NAME).zip $(VAULTS_CREATOR_ARTIFACTS_NAME).zip
	@$(MAKE) -s .upload-artifact ENV_NAME=prod
